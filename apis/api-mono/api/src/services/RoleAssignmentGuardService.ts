import { ForbiddenException } from '@/http/nodegen/errors';
import CompanyRepository from '@/database/CompanyRepository';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import PermissionRepository from '@/database/PermissionRepository';
import { SessionData } from '@/services/SessionService';
import { DEFAULT_COMPANY_ADMIN_ROLE, SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';
import { CompanyClass } from '@/database/models/CompanyModel';
import { CompanyMemberClass } from '@/database/models/CompanyMemberModel';

const ADMIN_ROLE_NAME = DEFAULT_COMPANY_ADMIN_ROLE.name;

interface GuardContext {
  company: CompanyClass;
  actorRoleName: string;
  actorPermissions: Set<string>;
  currentMember: CompanyMemberClass | null;
  // Lazy, memoized — only fetches when admin-demote rule actually fires.
  getAdminCount: () => Promise<number>;
}

/**
 * Guards against privilege escalation when a user assigns / changes a
 * company member's role.
 *
 * Rules enforced:
 *   1. SUPER_ADMIN bypasses.
 *   2. An actor cannot change their own role.
 *   3. Only an actor holding the default ADMIN role can change the role of
 *      a member whose current role is ADMIN.
 *   4. Demoting a member off the ADMIN role must leave at least one other
 *      active admin in the company.
 *   5. The target role's permission set must be a subset of the actor's
 *      (no granting a role with permissions you don't yourself have).
 *   6. When the target user already exists, that user's current role's
 *      permission set must also be a subset of the actor's (so you can't
 *      demote a higher-privileged user and rebind them).
 *
 * "Permission set" here is resolved by expanding a role's permissionGroups
 * to the underlying permission codes — i.e. the same surface the route-level
 * permission check uses at runtime.
 */
class RoleAssignmentGuardService {
  async assertCanAssignRole(input: {
    actor: SessionData;
    companyId: string;
    targetRoleName: string;
    targetUserId?: string;
  }): Promise<void> {
    if (this.isSuperAdmin(input.actor)) {
      return;
    }
    if (this.isSelfChange(input.actor, input.targetUserId)) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const context = await this.buildContext({
      actor: input.actor,
      companyId: input.companyId,
      targetUserId: input.targetUserId,
    });

    await this.assertCandidateRole(context, input.targetRoleName);
  }

  /**
   * Return the names of company roles this actor is permitted to assign
   * in the given context. Used by the role-select UI to disable options
   * the user can't pick.
   *
   * Semantics:
   *   - SUPER_ADMIN sees every defined role.
   *   - Self-edit returns []; the form should disable every option.
   */
  async getAssignableRoleNames(input: {
    actor: SessionData;
    companyId: string;
    targetUserId?: string;
  }): Promise<string[]> {
    if (this.isSuperAdmin(input.actor)) {
      const company = await CompanyRepository.findById(input.companyId);
      if (!company) {
        throw new ForbiddenException('Company not found');
      }
      return (company.roles || []).map((r) => r.name);
    }
    if (this.isSelfChange(input.actor, input.targetUserId)) {
      return [];
    }

    const context = await this.buildContext({
      actor: input.actor,
      companyId: input.companyId,
      targetUserId: input.targetUserId,
    });

    const assignable: string[] = [];
    for (const role of context.company.roles || []) {
      try {
        await this.assertCandidateRole(context, role.name);
        assignable.push(role.name);
      } catch (err) {
        if (err instanceof ForbiddenException) {
          continue;
        }
        throw err;
      }
    }
    return assignable;
  }

  private isSuperAdmin(actor: SessionData): boolean {
    return !!actor.userRoles?.includes(SYSTEM_SUPER_ADMIN);
  }

  private isSelfChange(actor: SessionData, targetUserId?: string): boolean {
    return !!targetUserId && targetUserId === actor.userId;
  }

  private async buildContext(input: {
    actor: SessionData;
    companyId: string;
    targetUserId?: string;
  }): Promise<GuardContext> {
    const company = await CompanyRepository.findById(input.companyId);
    if (!company) {
      throw new ForbiddenException('Company not found');
    }

    const actorMembership = await CompanyMemberRepository.findByCompanyAndUser({
      companyId: input.companyId,
      userId: input.actor.userId,
    });
    if (!actorMembership) {
      throw new ForbiddenException('You are not a member of this company');
    }

    const actorRole = company.roles?.find((r) => r.name === actorMembership.role);
    const actorPermissions = new Set(await PermissionRepository.findCodesByGroups(actorRole?.permissionGroups || []));

    const currentMember = input.targetUserId
      ? await CompanyMemberRepository.findByCompanyAndUser({
          companyId: input.companyId,
          userId: input.targetUserId,
        })
      : null;

    let cachedAdminCount: number | null = null;
    const getAdminCount = async () => {
      if (cachedAdminCount === null) {
        cachedAdminCount = await CompanyMemberRepository.countActiveAdminsByCompanyId(input.companyId);
      }
      return cachedAdminCount;
    };

    return {
      company,
      actorRoleName: actorMembership.role,
      actorPermissions,
      currentMember,
      getAdminCount,
    };
  }

  private async assertCandidateRole(context: GuardContext, candidateRoleName: string): Promise<void> {
    const targetRole = context.company.roles?.find((r) => r.name === candidateRoleName);
    if (!targetRole) {
      throw new ForbiddenException(`Role "${candidateRoleName}" does not exist in this company`);
    }

    await this.assertAdminRoleProtections(context, candidateRoleName);

    await this.assertSubset({
      actorPermissions: context.actorPermissions,
      candidateGroups: targetRole.permissionGroups || [],
      failure: 'You cannot assign a role that grants permissions you do not have',
    });

    if (context.currentMember) {
      const currentRole = context.company.roles?.find((r) => r.name === context.currentMember?.role);
      await this.assertSubset({
        actorPermissions: context.actorPermissions,
        candidateGroups: currentRole?.permissionGroups || [],
        failure: 'You cannot change the role of a member whose role has permissions you do not have',
      });
    }
  }

  private async assertAdminRoleProtections(context: GuardContext, candidateRoleName: string): Promise<void> {
    if (context.currentMember?.role !== ADMIN_ROLE_NAME) {
      return;
    }
    if (context.actorRoleName !== ADMIN_ROLE_NAME) {
      throw new ForbiddenException(`Only an ${ADMIN_ROLE_NAME} can change the role of an ${ADMIN_ROLE_NAME}`);
    }
    if (candidateRoleName !== ADMIN_ROLE_NAME) {
      const adminCount = await context.getAdminCount();
      if (adminCount <= 1) {
        throw new ForbiddenException(`A company must have at least one active ${ADMIN_ROLE_NAME}`);
      }
    }
  }

  private async assertSubset(input: {
    actorPermissions: Set<string>;
    candidateGroups: string[];
    failure: string;
  }): Promise<void> {
    const codes = await PermissionRepository.findCodesByGroups(input.candidateGroups);
    for (const code of codes) {
      if (!input.actorPermissions.has(code)) {
        throw new ForbiddenException(input.failure);
      }
    }
  }
}

export default new RoleAssignmentGuardService();
