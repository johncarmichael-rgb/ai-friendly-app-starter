import { UserModel, UserClass } from '@/database/models/UserModel';
import { BaseRepository } from '@/database/BaseRepository';

class UserRepository extends BaseRepository<UserClass> {
  constructor() {
    super(UserModel);
  }

  create(input: {
    email: string;
    firstName: string;
    lastName: string;
    createdBy: string;
    avatar?: string;
    displayName?: string;
    externalId?: string;
    roles?: string[];
  }) {
    const newUser = new this.model(input);
    return newUser.save();
  }

  findById(_id: string) {
    return this.model.findById(_id);
  }

  findByIds(ids: string[]) {
    return this.model.find({ _id: { $in: ids } });
  }

  findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  findByExternalId(externalId: string) {
    return this.model.findOne({ externalId });
  }

  findByCompanyId(companyId: string) {
    return this.model.find({ companyId }).sort({ createdAt: -1 });
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 });
  }

  findByRole(role: string) {
    return this.model.find({ roles: role });
  }

  /** Distinct system roles across all users (array field — returns distinct elements). */
  distinctRoles(): Promise<string[]> {
    return this.model.distinct('roles');
  }

  /** Distinct email addresses across all users (used to derive distinct email domains). */
  distinctEmails(): Promise<string[]> {
    return this.model.distinct('email');
  }

  update(input: { _id: string; updates: Partial<UserClass> }) {
    return this.model.findByIdAndUpdate(input._id, input.updates, { returnDocument: 'after' });
  }
}

export default new UserRepository();
