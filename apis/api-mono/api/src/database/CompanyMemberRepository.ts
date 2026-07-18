import { CompanyMemberClass, CompanyMemberModel } from '@/database/models/CompanyMemberModel';
import { Status } from '@/http/nodegen/interfaces/CompanyMember';
import { BaseRepository } from '@/database/BaseRepository';
import { DEFAULT_COMPANY_ADMIN_ROLE } from '@/constants/ROLES';

class CompanyMemberRepository extends BaseRepository<CompanyMemberClass> {
  constructor() {
    super(CompanyMemberModel);
  }

  create(input: {
    companyId: string;
    userId: string;
    name: string;
    role: string;
    invitedBy: string;
    status?: Status;
    invitedAt?: Date;
    joinedAt?: Date;
    isExternal?: boolean;
  }) {
    const newMember = new this.model({
      ...input,
      status: input.status || Status.Active,
      invitedAt: input.invitedAt || new Date(),
      joinedAt: input.joinedAt || new Date(),
    });
    return newMember.save();
  }

  // eslint-disable-next-line max-lines-per-function
  async findByCompanyId(input: {
    companyId: string;
    offset: number;
    limit: number;
    search?: string;
    role?: string;
    locationId?: string;
    locationIds?: string[];
    status?: string;
    isExternal?: boolean;
    userId?: string;
  }) {
    const matchStage: any = { companyId: input.companyId };

    // Add direct filters to initial match stage
    if (input.userId) {
      matchStage.userId = input.userId;
    }
    if (input.role) {
      matchStage.role = input.role;
    }
    if (input.locationIds && input.locationIds.length > 0) {
      matchStage.locationId = { $in: input.locationIds };
    } else if (input.locationId) {
      matchStage.locationId = input.locationId;
    }
    if (input.status) {
      matchStage.status = input.status;
    }
    if (input.isExternal === true) {
      matchStage.isExternal = true;
    } else if (input.isExternal === false) {
      // Treat missing/undefined isExternal as internal (false)
      matchStage.isExternal = { $ne: true };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location',
        },
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
    ];

    // Add search filter if provided
    if (input.search) {
      pipeline.push({
        $match: {
          $or: [
            { role: { $regex: input.search, $options: 'i' } },
            { 'user.firstName': { $regex: input.search, $options: 'i' } },
            { 'user.lastName': { $regex: input.search, $options: 'i' } },
            { 'user.email': { $regex: input.search, $options: 'i' } },
          ],
        },
      });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.model.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: input.offset }, { $limit: input.limit });

    // Project to match the expected structure
    pipeline.push({
      $project: {
        _id: 0, // Exclude root _id to avoid duplication
        companyMember: {
          _id: '$_id',
          companyId: '$companyId',
          userId: '$userId',
          role: '$role',
          locationId: '$locationId',
          managerUserId: '$managerUserId',
          status: '$status',
          isExternal: '$isExternal',
          invitedBy: '$invitedBy',
          invitedAt: '$invitedAt',
          joinedAt: '$joinedAt',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
        },
        user: {
          _id: '$user._id',
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          displayName: '$user.displayName',
          avatar: '$user.avatar',
          externalId: '$user.externalId',
          roles: '$user.roles',
          createdBy: '$user.createdBy',
          createdAt: '$user.createdAt',
          updatedAt: '$user.updatedAt',
        },
        location: {
          $cond: {
            if: { $ifNull: ['$location._id', false] },
            then: {
              _id: '$location._id',
              name: '$location.name',
              type: '$location.type',
              code: '$location.code',
              address: '$location.address',
              phone: '$location.phone',
              parentId: '$location.parentId',
              level: '$location.level',
              companyId: '$location.companyId',
              createdBy: '$location.createdBy',
              createdAt: '$location.createdAt',
              updatedAt: '$location.updatedAt',
            },
            else: '$$REMOVE',
          },
        },
      },
    });

    const data = await this.model.aggregate(pipeline);

    return {
      data,
      totalCount,
      offset: input.offset,
    };
  }

  findByUser(userId: string) {
    return this.model.find({ userId });
  }

  /**
   * Count members assigned to a company. Used for the "registered users"
   * metric in usage analytics.
   */
  countByCompanyId(companyId: string): Promise<number> {
    return this.model.countDocuments({ companyId });
  }

  /**
   * Count members per company across ALL companies. Used for the "registered
   * users" column in the multi-tenant usage comparison.
   */
  async countsByCompany(): Promise<{ companyId: string; count: number }[]> {
    const rows: { _id: string; count: number }[] = await this.model.aggregate([
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);
    return rows.map((row) => ({ companyId: row._id, count: row.count }));
  }

  /**
   * Find all companies a user belongs to (active memberships only).
   * Returns companyId, name, and logo for the company selection screen.
   */
  async findCompaniesForUser(userId: string): Promise<{ companyId: string; name: string; logo?: string }[]> {
    const pipeline = [
      { $match: { userId, status: Status.Active } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          companyId: '$company._id',
          name: '$company.name',
          logo: '$company.logo',
        },
      },
    ];
    return this.model.aggregate(pipeline);
  }

  findById(_id: string) {
    return this.model.findById(_id);
  }

  update(input: { _id: string; updates: Partial<CompanyMemberClass> }) {
    return this.model.findByIdAndUpdate(input._id, input.updates, { returnDocument: 'after' });
  }

  delete(_id: string) {
    return this.model.findByIdAndDelete(_id);
  }

  /**
   * Remove dangling manager links: clear managerUserId on any members in the
   * company who pointed at the given (now-removed) user. Keeps the webhook
   * "email the creator's manager" feature from referencing a dead manager.
   */
  clearManagerReferences(input: { companyId: string; managerUserId: string }) {
    return this.model.updateMany(
      { companyId: input.companyId, managerUserId: input.managerUserId },
      { $unset: { managerUserId: '' } },
    );
  }

  /**
   * Check if a user has access to a company (is an active member)
   */
  async userHasAccessToCompany(input: { companyId: string; userId: string }): Promise<boolean> {
    const member = await this.model.findOne({
      companyId: input.companyId,
      userId: input.userId,
      status: Status.Active,
    });
    return !!member;
  }

  /**
   * Find a company member by companyId and userId
   */
  findByCompanyAndUser(input: { companyId: string; userId: string }) {
    return this.model.findOne({
      companyId: input.companyId,
      userId: input.userId,
    });
  }

  /**
   * Autocomplete users by email within a company
   * Returns users whose email contains the search term
   */
  async autocompleteByEmail(input: { companyId: string; email: string }) {
    const pipeline: any[] = [
      { $match: { companyId: input.companyId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          'user.email': { $regex: input.email, $options: 'i' },
        },
      },
      { $limit: 10 },
      {
        $project: {
          _id: '$user._id',
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          displayName: '$user.displayName',
        },
      },
    ];

    return this.model.aggregate(pipeline);
  }

  /**
   * Count active members in a company holding the default ADMIN role.
   */
  async countActiveAdminsByCompanyId(companyId: string): Promise<number> {
    return this.model.countDocuments({
      companyId,
      role: DEFAULT_COMPANY_ADMIN_ROLE.name,
      status: Status.Active,
    });
  }

  /**
   * Find all admin members of a company with their user info
   * Returns members with ADMIN role and their associated user data
   */
  async findAdminsByCompanyId(companyId: string) {
    const pipeline: any[] = [
      { $match: { companyId, role: DEFAULT_COMPANY_ADMIN_ROLE.name, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 1,
          companyId: 1,
          userId: 1,
          role: 1,
          user: {
            _id: '$user._id',
            email: '$user.email',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
          },
        },
      },
    ];

    return this.model.aggregate(pipeline);
  }

  /**
   * Get display names for users by their IDs within a company
   * Returns user ID and display name (firstName + lastName or email fallback)
   */
  async getDisplayNamesByUserIds(input: { companyId: string; userIds: string[] }) {
    const pipeline: any[] = [
      { $match: { companyId: input.companyId, userId: { $in: input.userIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: '$user._id',
          displayName: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $strLenCP: { $ifNull: ['$user.firstName', ''] } }, 0] },
                  { $gt: [{ $strLenCP: { $ifNull: ['$user.lastName', ''] } }, 0] },
                ],
              },
              then: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              else: {
                $cond: {
                  if: { $gt: [{ $strLenCP: { $ifNull: ['$user.displayName', ''] } }, 0] },
                  then: '$user.displayName',
                  else: '$user.email',
                },
              },
            },
          },
        },
      },
    ];

    return this.model.aggregate(pipeline);
  }

  /**
   * Get all active user IDs in a company
   */
  async getActiveUserIdsByCompany(companyId: string): Promise<string[]> {
    const members = await this.model.find({ companyId, status: Status.Active }).select('userId');
    return members.map((m) => m.userId);
  }

  /**
   * Get all active user IDs at a specific location
   */
  async getActiveUserIdsByLocation(companyId: string, locationId: string): Promise<string[]> {
    const members = await this.model.find({ companyId, locationId, status: Status.Active }).select('userId');
    return members.map((m) => m.userId);
  }

  /**
   * Get all active user IDs at any of the specified locations
   */
  async getActiveUserIdsByLocations(companyId: string, locationIds: string[]): Promise<string[]> {
    const members = await this.model
      .find({ companyId, locationId: { $in: locationIds }, status: Status.Active })
      .select('userId');
    return [...new Set(members.map((m) => m.userId))]; // Dedupe
  }

  /**
   * Get user IDs at any of the specified locations with optional status filtering
   */
  async getUserIdsByLocations(input: { companyId: string; locationIds: string[]; status?: Status }): Promise<string[]> {
    const query: any = {
      companyId: input.companyId,
      locationId: { $in: input.locationIds },
    };

    if (input.status) {
      query.status = input.status;
    }

    const members = await this.model.find(query).select('userId');

    return [...new Set(members.map((m) => m.userId))];
  }

  /**
   * Get all active user externalIds in a company (for socket targeting)
   * Returns externalId values that match IAP sub claims
   */
  async getActiveUserExternalIdsByCompany(companyId: string): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.externalId': { $exists: true, $ne: null } } },
      { $project: { externalId: '$user.externalId' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.externalId))]; // Dedupe
  }

  /**
   * Get all active user externalIds at a specific location (for socket targeting)
   */
  async getActiveUserExternalIdsByLocation(companyId: string, locationId: string): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, locationId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.externalId': { $exists: true, $ne: null } } },
      { $project: { externalId: '$user.externalId' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.externalId))]; // Dedupe
  }

  /**
   * Get all active user externalIds at any of the specified locations (for socket targeting)
   */
  async getActiveUserExternalIdsByLocations(companyId: string, locationIds: string[]): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, locationId: { $in: locationIds }, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.externalId': { $exists: true, $ne: null } } },
      { $project: { externalId: '$user.externalId' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.externalId))]; // Dedupe
  }

  /**
   * Get externalId for a specific user in a company (for socket targeting)
   */
  async getUserExternalIdByCompanyAndUser(companyId: string, userId: string): Promise<string | null> {
    const pipeline = [
      { $match: { companyId, userId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.externalId': { $exists: true, $ne: null } } },
      { $project: { externalId: '$user.externalId' } },
      { $limit: 1 },
    ];
    const results = await this.model.aggregate(pipeline);
    return results.length > 0 ? results[0].externalId : null;
  }

  /**
   * Get all active user emails in a company (for email-based socket targeting)
   */
  async getActiveUserEmailsByCompany(companyId: string): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.email': { $exists: true, $ne: null } } },
      { $project: { email: '$user.email' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.email))];
  }

  /**
   * Get all active user emails at a specific location (for email-based socket targeting)
   */
  async getActiveUserEmailsByLocation(companyId: string, locationId: string): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, locationId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.email': { $exists: true, $ne: null } } },
      { $project: { email: '$user.email' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.email))];
  }

  /**
   * Get all active user emails at any of the specified locations (for email-based socket targeting)
   */
  async getActiveUserEmailsByLocations(companyId: string, locationIds: string[]): Promise<string[]> {
    const pipeline = [
      { $match: { companyId, locationId: { $in: locationIds }, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.email': { $exists: true, $ne: null } } },
      { $project: { email: '$user.email' } },
    ];
    const results = await this.model.aggregate(pipeline);
    return [...new Set(results.map((r) => r.email))];
  }

  /**
   * Get email for a specific user in a company (for email-based socket targeting)
   */
  async getUserEmailByCompanyAndUser(companyId: string, userId: string): Promise<string | null> {
    const pipeline = [
      { $match: { companyId, userId, status: Status.Active } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      { $match: { 'user.email': { $exists: true, $ne: null } } },
      { $project: { email: '$user.email' } },
      { $limit: 1 },
    ];
    const results = await this.model.aggregate(pipeline);
    return results.length > 0 ? results[0].email : null;
  }
}

export default new CompanyMemberRepository();
