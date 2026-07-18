import { create } from 'zustand';
import AdminService from 'apis/api-mono/services/AdminService';
import { Company } from 'apis/api-mono/services/interfaces/Company';
import { CompanyMember } from 'apis/api-mono/services/interfaces/CompanyMember';

interface CompanyWithMembers extends Company {
  members?: CompanyMember[];
}

interface CompaniesState {
  companies: CompanyWithMembers[];
  companyMembers: Map<string, CompanyMember[]>; // companyId -> members
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  fetchCompanyMembers: (companyId: string) => Promise<void>;
  fetchAllCompanyMembers: () => Promise<void>;
  getUserCompanies: (userId: string) => Company[];
  createCompany: (data: Partial<Company>) => Promise<void>;
  updateCompany: (companyId: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  updateCompanyFeatures: (companyId: string, featureCodes: string[]) => Promise<void>;
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  companyMembers: new Map(),
  loading: false,
  error: null,

  fetchCompanies: async () => {
    const { loading } = get();
    if (loading) return; // Prevent duplicate calls
    
    set({ loading: true, error: null });
    try {
      const companies = await AdminService.adminCompanyGet({ offset: 0, limit: 100 });
      set({ companies: companies || [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch companies', loading: false });
      console.error('Error fetching companies:', error);
    }
  },

  createCompany: async (data) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminCompanyPost(data as any);
      // Temporarily set loading to false so fetchCompanies can run
      set({ loading: false });
      await get().fetchCompanies();
    } catch (error) {
      set({ error: 'Failed to create company', loading: false });
      console.error('Error creating company:', error);
      throw error;
    }
  },

  updateCompany: async (companyId, data) => {
    set({ loading: true, error: null });
    try {
      await AdminService.adminCompanyCompanyIdPut(data as any, { companyId });
      // Temporarily set loading to false so fetchCompanies can run
      set({ loading: false });
      await get().fetchCompanies();
    } catch (error) {
      set({ error: 'Failed to update company', loading: false });
      console.error('Error updating company:', error);
      throw error;
    }
  },

  deleteCompany: async (companyId: string) => {
    set({ loading: true, error: null });
    try {
      // Note: Delete endpoint needs to be added to API spec
      // For now, this will fail gracefully
      console.warn('Delete company endpoint not yet implemented in API', companyId);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to delete company', loading: false });
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  fetchCompanyMembers: async (companyId: string) => {
    try {
      const response = await AdminService.adminCompanyCompanyIdCompanyMemberGet(
        { companyId },
        { offset: 0, limit: 100 }
      );
      
      console.log(`[CompaniesStore] Fetched members for company ${companyId}:`, response);
      
      // Extract data array from paginated response
      // The response structure is { data: [...], meta: {...} }
      const members = (response as any)?.data || [];
      
      console.log(`[CompaniesStore] Extracted ${members.length} members:`, members);
      
      const { companyMembers } = get();
      const newMap = new Map(companyMembers);
      newMap.set(companyId, members);
      set({ companyMembers: newMap });
    } catch (error) {
      console.error(`Error fetching members for company ${companyId}:`, error);
    }
  },

  fetchAllCompanyMembers: async () => {
    const { companies } = get();

    // Fetch all member lists in parallel, then batch-set into the map once.
    // Using fetchCompanyMembers individually with Promise.all causes a race:
    // each call reads the same (empty) map snapshot and the last writer wins.
    const results = await Promise.allSettled(
      companies.map(async (company) => {
        const response = await AdminService.adminCompanyCompanyIdCompanyMemberGet(
          { companyId: company._id },
          { offset: 0, limit: 100 },
        );
        const members = (response as any)?.data || [];
        return { companyId: company._id, members };
      }),
    );

    const newMap = new Map(get().companyMembers);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        newMap.set(result.value.companyId, result.value.members);
      }
    }
    set({ companyMembers: newMap });
  },

  getUserCompanies: (userId: string) => {
    const { companies, companyMembers } = get();
    
    return companies.filter((company) => {
      const members = companyMembers.get(company._id) || [];
      
      // Handle nested structure from repository: { companyMember: {...}, user: {...} }
      return members.some((item: any) => {
        // Check if it's the nested structure or flat structure
        const memberId = item.companyMember?.userId || item.userId;
        return memberId === userId;
      });
    });
  },

  updateCompanyFeatures: async (companyId: string, featureCodes: string[]) => {
    try {
      await AdminService.adminCompanyCompanyIdFeatureCodesPut(
        { featureCodes },
        { companyId }
      );
      // Refresh companies to get updated feature codes
      set({ loading: false });
      await get().fetchCompanies();
    } catch (error) {
      console.error('Error updating company features:', error);
      throw error;
    }
  },
}));
