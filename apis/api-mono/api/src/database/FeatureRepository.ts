import { FeatureModel, FeatureClass } from '@/database/models/FeatureModel';
import { BaseRepository } from '@/database/BaseRepository';
import { FeatureDefinition } from '@/constants/FEATURE_CODES';

class FeatureRepository extends BaseRepository<FeatureClass> {
  constructor() {
    super(FeatureModel);
  }

  /**
   * Upsert a feature by code.
   * If the feature exists, update name and description.
   * If it doesn't exist, create it.
   */
  async upsert(feature: FeatureDefinition): Promise<FeatureClass> {
    const result = await this.model.findOneAndUpdate(
      { code: feature.code },
      {
        $set: {
          name: feature.name,
          description: feature.description,
        },
        $setOnInsert: {
          code: feature.code,
          isActive: true,
          createdBy: 'system',
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    return result;
  }

  findAll(input?: { offset?: number; limit?: number; search?: string }) {
    const { offset = 0, limit = 25, search } = input || {};

    let query = {};
    if (search) {
      query = {
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    return this.model.find(query).sort({ code: 1 }).skip(offset).limit(limit);
  }

  findById(_id: string) {
    return this.model.findById(_id);
  }

  findByCode(code: string) {
    return this.model.findOne({ code });
  }

  update(input: { _id: string; updates: Partial<FeatureClass> }) {
    // Explicitly exclude code from updates - code is immutable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code, ...safeUpdates } = input.updates as any;
    return this.model.findByIdAndUpdate(input._id, safeUpdates, { returnDocument: 'after' });
  }

  delete(_id: string) {
    return this.model.findByIdAndDelete(_id);
  }
}

export default new FeatureRepository();
