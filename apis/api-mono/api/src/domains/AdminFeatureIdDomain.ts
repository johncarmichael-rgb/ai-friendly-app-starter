import {
  AdminFeatureFeatureIdDeletePath,
  AdminFeatureFeatureIdGetPath,
  AdminFeatureFeatureIdPatchPath,
  AdminFeatureFeatureIdPatchPatch,
  Feature,
  GenericDeleteSuccess,
} from '@/http/nodegen/interfaces';

import { AdminFeatureIdDomainInterface } from '@/http/nodegen/domainInterfaces/AdminFeatureIdDomainInterface';
import FeatureRepository from '@/database/FeatureRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';

class AdminFeatureIdDomain implements AdminFeatureIdDomainInterface {
  public async adminFeatureFeatureIdDelete(
    params: AdminFeatureFeatureIdDeletePath,
    req: any,
  ): Promise<GenericDeleteSuccess> {
    const { featureId } = params;

    const feature = await FeatureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    await FeatureRepository.delete(featureId);
    return { success: true };
  }

  public async adminFeatureFeatureIdGet(params: AdminFeatureFeatureIdGetPath, req: any): Promise<Feature> {
    const { featureId } = params;

    const feature = await FeatureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    return feature;
  }

  public async adminFeatureFeatureIdPatch(
    body: AdminFeatureFeatureIdPatchPatch,
    params: AdminFeatureFeatureIdPatchPath,
    req: any,
  ): Promise<Feature> {
    const { featureId } = params;

    const feature = await FeatureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // Explicitly exclude code from updates - code is immutable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code, ...safeUpdates } = body as any;

    const updatedFeature = await FeatureRepository.update({
      _id: featureId,
      updates: safeUpdates,
    });

    if (!updatedFeature) {
      throw new NotFoundException('Feature not found after update');
    }

    return updatedFeature;
  }
}

export default new AdminFeatureIdDomain();
