import {
  AdminFeatureFeatureIdDeletePath,
  AdminFeatureFeatureIdGetPath,
  AdminFeatureFeatureIdPatchPatch,
  AdminFeatureFeatureIdPatchPath,
  Feature,
  GenericDeleteSuccess,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminFeatureIdDomainInterface {
  /**
   * Operation ID: adminFeatureFeatureIdDelete
   * Summary: Delete a feature based on {featureId}, from _admin
   * Description: No description written
   * Permission string: apiAdminFeatureFeatureIdDelete
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminFeatureFeatureIdDelete(
    params: AdminFeatureFeatureIdDeletePath,
    req: any
  ): Promise<GenericDeleteSuccess>;

  /**
   * Operation ID: adminFeatureFeatureIdGet
   * Summary: Get feature based on {featureId}, from _admin
   * Description: No description written
   * Permission string: apiAdminFeatureFeatureIdRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminFeatureFeatureIdGet(
    params: AdminFeatureFeatureIdGetPath,
    req: any
  ): Promise<Feature>;

  /**
   * Operation ID: adminFeatureFeatureIdPatch
   * Summary: Update part of a feature based on {featureId}, from _admin
   * Description: No description written
   * Permission string: apiAdminFeatureFeatureIdUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminFeatureFeatureIdPatch(
    body: AdminFeatureFeatureIdPatchPatch,
    params: AdminFeatureFeatureIdPatchPath,
    req: any
  ): Promise<Feature>;
}
