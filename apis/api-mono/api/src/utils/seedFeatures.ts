import { FEATURE_DEFINITIONS } from '@/constants/FEATURE_CODES';
import FeatureRepository from '@/database/FeatureRepository';

/**
 * Seeds/upserts all feature definitions into the database.
 * This ensures all defined features exist in the database with current metadata.
 * Safe to run multiple times - will update existing features without duplicating.
 */
export default async function seedFeatures(): Promise<void> {
  console.log('Seeding features...');

  for (const feature of FEATURE_DEFINITIONS) {
    await FeatureRepository.upsert(feature);
    console.log(`  ✓ Feature upserted: ${feature.code}`);
  }

  console.log(`Features seeded: ${FEATURE_DEFINITIONS.length} features`);
}
