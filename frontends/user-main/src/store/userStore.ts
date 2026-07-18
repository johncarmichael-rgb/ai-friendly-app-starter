import { create } from 'zustand';
import UserService from 'apis/api-mono/services/UserService';
import { User } from 'apis/api-mono/services/interfaces/User';
import { UserCompany } from 'apis/api-mono/services/interfaces/UserCompany';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  loading: false,
  error: null,

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const response: UserCompany = await UserService.userCurrentGet();
      // Extract user from UserCompany response
      set({ currentUser: response?.user || null, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch current user', loading: false });
      console.error('Error fetching current user:', error);
    }
  },
}));
