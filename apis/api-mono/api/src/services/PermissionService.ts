import NodegenRequest from '@/http/interfaces/NodegenRequest';
import express from 'express';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import { ForbiddenException } from '@/http/nodegen/errors';
import CompanyRepository from '@/database/CompanyRepository';
import PermissionRepository from '@/database/PermissionRepository';
import { SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';

class PermissionService {
  /**
   * Resolve the user's permission groups for their role in a specific company.
   *
   * companyId is typed optional to match SessionData (which is briefly null
   * between login and select-company), but at runtime it must be provided —
   * we throw rather than silently falling back to an arbitrary membership,
   * which would leak permissions between companies for multi-company users.
   * SessionMiddleware guarantees req.sessionData.companyId is set on every
   * authenticated request, so call sites can pass it directly.
   */
  private async resolvePermissionGroups(input: { userId: string; companyId?: string }): Promise<string[] | null> {
    if (!input.companyId) {
      throw new Error('PermissionService: companyId is required to resolve permission groups');
    }

    const activeMembership = await CompanyMemberRepository.findByCompanyAndUser({
      companyId: input.companyId,
      userId: input.userId,
    });

    if (!activeMembership) {
      return null;
    }

    const company = await CompanyRepository.findById(activeMembership.companyId);
    if (!company) {
      return null;
    }

    const companyRole = company.roles?.find((role) => role.name === activeMembership.role);
    if (!companyRole?.permissionGroups?.length) {
      return null;
    }

    return companyRole.permissionGroups;
  }

  /**
   * Check if a user has a specific permission within a given company.
   */
  async doesUserHavePermission(input: { userId: string; companyId?: string; permission: string }): Promise<boolean> {
    const groups = await this.resolvePermissionGroups(input);
    if (!groups) {
      return false;
    }
    return PermissionRepository.doesPermissionExistInGroups({
      permission: input.permission,
      groupNames: groups,
    });
  }

  /**
   * Check if a user has a specific permission group assigned to their role within a given company.
   */
  async doesUserHavePermissionGroup(input: {
    userId: string;
    companyId?: string;
    groupName: string;
  }): Promise<boolean> {
    const groups = await this.resolvePermissionGroups(input);
    if (!groups) {
      return false;
    }
    return groups.includes(input.groupName);
  }

  middleware(req: NodegenRequest, res: express.Response, next: express.NextFunction, permission: string) {
    if (req.sessionData.userRoles.includes(SYSTEM_SUPER_ADMIN)) {
      next();
    } else {
      this.doesUserHavePermission({
        userId: req.sessionData.userId,
        permission,
        companyId: req.sessionData.companyId,
      })
        .then((pass) => {
          if (pass) {
            next();
          } else {
            next(new ForbiddenException());
          }
        })
        .catch(next);
    }
  }
}

export default new PermissionService();
