import {
  AdminPermissionPermissionIdDeletePath,
  AdminPermissionPermissionIdGetPath,
  AdminPermissionPermissionIdPatchPatch,
  AdminPermissionPermissionIdPatchPath,
  GenericDeleteSuccess,
  Permission,
} from '@/http/nodegen/interfaces';

import { AdminPermissionIdDomainInterface } from '@/http/nodegen/domainInterfaces/AdminPermissionIdDomainInterface';
import PermissionRepository from '@/database/PermissionRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';
import { BadRequestException } from '@/http/nodegen/errors/BadRequestException';

class AdminPermissionIdDomain implements AdminPermissionIdDomainInterface {
  public async adminPermissionPermissionIdDelete(
    params: AdminPermissionPermissionIdDeletePath,
    req: any,
  ): Promise<GenericDeleteSuccess> {
    const permission = await PermissionRepository.findById(params.permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.isCustom) {
      throw new BadRequestException(
        'Cannot delete OpenAPI-derived permissions. Only custom permissions can be deleted.',
      );
    }

    const deleted = await PermissionRepository.delete(params.permissionId);
    if (!deleted) {
      throw new NotFoundException('Permission not found or could not be deleted');
    }

    return { success: true };
  }

  public async adminPermissionPermissionIdGet(
    params: AdminPermissionPermissionIdGetPath,
    req: any,
  ): Promise<Permission> {
    const permission = await PermissionRepository.findById(params.permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      _id: permission._id,
      code: permission.code,
      name: permission.name,
      group: permission.group,
      isCustom: permission.isCustom,
    };
  }

  public async adminPermissionPermissionIdPatch(
    body: AdminPermissionPermissionIdPatchPatch,
    params: AdminPermissionPermissionIdPatchPath,
    req: any,
  ): Promise<Permission> {
    const permission = await PermissionRepository.findById(params.permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Update name and/or group if provided
    if (body.name !== undefined || body.group !== undefined) {
      const updated = await PermissionRepository.update({
        _id: params.permissionId,
        name: body.name,
        group: body.group,
      });

      if (!updated) {
        throw new NotFoundException('Permission not found');
      }

      return {
        _id: updated._id,
        code: updated.code,
        name: updated.name,
        group: updated.group,
        isCustom: updated.isCustom,
      };
    }

    return {
      _id: permission._id,
      code: permission.code,
      name: permission.name,
      group: permission.group,
      isCustom: permission.isCustom,
    };
  }
}

export default new AdminPermissionIdDomain();
