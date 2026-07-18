import { create } from 'zustand';
import AdminService from 'apis/api-mono/services/AdminService';
import { Feature } from 'apis/api-mono/services/interfaces/Feature';

interface FeaturesState {
  features: Feature[];
  loading: boolean;
  error: string | null;
  fetchFeatures: () => Promise<void>;
  updateFeature: (featureId: string, data: Partial<Feature>) => Promise<void>;
  deleteFeature: (featureId: string) => Promise<void>;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  features: [],
  loading: false,
  error: null,

  fetchFeatures: async () => {
    const { loading } = get();
    if (loading) return; // Prevent duplicate calls
    
    set({ loading: true, error: null });
    try {
      const features = await AdminService.adminFeatureGet({ offset: 0, limit: 100 });
      set({ features: features || [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch features', loading: false });
      console.error('Error fetching features:', error);
    }
  },

  updateFeature: async (featureId, data) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminFeatureFeatureIdPatch(data as any, { featureId });
      // Temporarily set loading to false so fetchFeatures can run
      set({ loading: false });
      await get().fetchFeatures();
    } catch (error) {
      set({ error: 'Failed to update feature', loading: false });
      console.error('Error updating feature:', error);
      throw error;
    }
  },

  deleteFeature: async (featureId: string) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminFeatureFeatureIdDelete({ featureId });
      // Temporarily set loading to false so fetchFeatures can run
      set({ loading: false });
      await get().fetchFeatures();
    } catch (error) {
      set({ error: 'Failed to delete feature', loading: false });
      console.error('Error deleting feature:', error);
      throw error;
    }
  },
}));
