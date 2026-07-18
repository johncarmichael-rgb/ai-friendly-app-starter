import { create } from 'zustand';
import AdminService from 'apis/api-mono/services/AdminService';
import { Permission } from 'apis/api-mono/services/interfaces/Permission';

interface PermissionsState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<void>;
  createPermission: (data: { code: string; name: string; group?: string }) => Promise<void>;
  updatePermission: (permissionId: string, data: { name?: string; group?: string }) => Promise<void>;
  deletePermission: (permissionId: string) => Promise<void>;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: [],
  loading: false,
  error: null,

  fetchPermissions: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const permissions = await AdminService.adminPermissionGet({ offset: 0, limit: 999 });
      set({ permissions: permissions || [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch permissions', loading: false });
      console.error('Error fetching permissions:', error);
    }
  },

  createPermission: async (data) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminPermissionPost(data);
      set({ loading: false });
      await get().fetchPermissions();
    } catch (error) {
      set({ error: 'Failed to create permission', loading: false });
      console.error('Error creating permission:', error);
      throw error;
    }
  },

  updatePermission: async (permissionId, data) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminPermissionPermissionIdPatch(data, { permissionId });
      set({ loading: false });
      await get().fetchPermissions();
    } catch (error) {
      set({ error: 'Failed to update permission', loading: false });
      console.error('Error updating permission:', error);
      throw error;
    }
  },

  deletePermission: async (permissionId: string) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminPermissionPermissionIdDelete({ permissionId });
      set({ loading: false });
      await get().fetchPermissions();
    } catch (error) {
      set({ error: 'Failed to delete permission', loading: false });
      console.error('Error deleting permission:', error);
      throw error;
    }
  },
}));
