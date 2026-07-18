import {
  AdminSession,
  AdminUsersUserIdRolesPutPath,
  AdminUsersUserIdRolesPutPut,
  AdminUsersUserIdSessionsDeletePath,
  AdminUsersUserIdSessionsGetPath,
  GenericDeleteSuccess,
  User,
} from '@/http/nodegen/interfaces';

import { AdminUserIdDomainInterface } from '@/http/nodegen/domainInterfaces/AdminUserIdDomainInterface';
import UserRepository from '@/database/UserRepository';
import SessionRepository from '@/database/SessionRepository';
import { ForbiddenException, NotFoundException } from '@/http/nodegen/errors';
import { SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';

class AdminUserIdDomain implements AdminUserIdDomainInterface {
  public async adminUsersUserIdGet(params: any, req: any): Promise<User> {
    const { userId } = params;

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    return user;
  }

  public async adminUsersUserIdRolesPut(
    body: AdminUsersUserIdRolesPutPut,
    params: AdminUsersUserIdRolesPutPath,
    req: any,
  ): Promise<User> {
    const { userId } = params;

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Sanitise: SUPER_ADMIN is the only assignable system role. An empty array
    // demotes the user to a standard account. De-dupe and drop anything else.
    const roles = Array.from(new Set((body.roles || []).map((role) => String(role)))).filter(
      (role) => role === SYSTEM_SUPER_ADMIN,
    );

    // Guard against self-lockout: an admin cannot strip their own SUPER_ADMIN.
    const actingUserId = req.sessionData?.userId;
    if (actingUserId === userId && user.roles?.includes(SYSTEM_SUPER_ADMIN) && !roles.includes(SYSTEM_SUPER_ADMIN)) {
      throw new ForbiddenException('You cannot remove your own SUPER_ADMIN role.');
    }

    const updated = await UserRepository.update({ _id: userId, updates: { roles } });
    if (!updated) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    return updated;
  }

  public async adminUsersUserIdSessionsDelete(
    params: AdminUsersUserIdSessionsDeletePath,
    req: any,
  ): Promise<GenericDeleteSuccess> {
    const { userId } = params;

    // Verify user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Delete all sessions for this user
    await SessionRepository.deleteAllUserSessions(userId);

    return { success: true };
  }

  public async adminUsersUserIdSessionsGet(params: AdminUsersUserIdSessionsGetPath, req: any): Promise<AdminSession[]> {
    const { userId } = params;

    // Verify user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Get all active sessions for this user
    const sessions = await SessionRepository.findByUserId(userId);

    return sessions as AdminSession[];
  }
}

export default new AdminUserIdDomain();
