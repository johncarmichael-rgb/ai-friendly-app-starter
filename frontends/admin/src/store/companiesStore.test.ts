import { describe, it, expect, beforeEach } from 'vitest';
import { useCompaniesStore } from './companiesStore';

describe('companiesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCompaniesStore.setState({
      companies: [],
      companyMembers: new Map(),
      loading: false,
      error: null,
    });
  });

  describe('getUserCompanies', () => {
    it('returns empty array when no companies exist', () => {
      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toEqual([]);
    });

    it('returns empty array when user is not a member of any company', () => {
      const companies = [
        { _id: 'company-1', name: 'Company 1' },
        { _id: 'company-2', name: 'Company 2' },
      ];
      const companyMembers = new Map([
        ['company-1', [{ userId: 'other-user' }]],
        ['company-2', [{ userId: 'another-user' }]],
      ]);

      useCompaniesStore.setState({ companies, companyMembers } as any);

      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toEqual([]);
    });

    it('returns companies where user is a member (flat structure)', () => {
      const companies = [
        { _id: 'company-1', name: 'Company 1' },
        { _id: 'company-2', name: 'Company 2' },
        { _id: 'company-3', name: 'Company 3' },
      ];
      const companyMembers = new Map([
        ['company-1', [{ userId: 'user-1' }, { userId: 'user-2' }]],
        ['company-2', [{ userId: 'user-3' }]],
        ['company-3', [{ userId: 'user-1' }]],
      ]);

      useCompaniesStore.setState({ companies, companyMembers } as any);

      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c._id)).toEqual(['company-1', 'company-3']);
    });

    it('returns companies where user is a member (nested structure)', () => {
      const companies = [
        { _id: 'company-1', name: 'Company 1' },
        { _id: 'company-2', name: 'Company 2' },
      ];
      // Nested structure: { companyMember: {...}, user: {...} }
      const companyMembers = new Map([
        [
          'company-1',
          [
            { companyMember: { userId: 'user-1' }, user: { name: 'User 1' } },
            { companyMember: { userId: 'user-2' }, user: { name: 'User 2' } },
          ],
        ],
        ['company-2', [{ companyMember: { userId: 'user-3' }, user: { name: 'User 3' } }]],
      ]);

      useCompaniesStore.setState({ companies, companyMembers } as any);

      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('company-1');
    });

    it('handles companies with no members in the map', () => {
      const companies = [
        { _id: 'company-1', name: 'Company 1' },
        { _id: 'company-2', name: 'Company 2' },
      ];
      // Only company-1 has members loaded
      const companyMembers = new Map([['company-1', [{ userId: 'user-1' }]]]);

      useCompaniesStore.setState({ companies, companyMembers } as any);

      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('company-1');
    });

    it('handles mixed flat and nested structures', () => {
      const companies = [
        { _id: 'company-1', name: 'Company 1' },
        { _id: 'company-2', name: 'Company 2' },
      ];
      const companyMembers = new Map([
        ['company-1', [{ userId: 'user-1' }]], // flat
        ['company-2', [{ companyMember: { userId: 'user-1' } }]], // nested
      ]);

      useCompaniesStore.setState({ companies, companyMembers } as any);

      const result = useCompaniesStore.getState().getUserCompanies('user-1');
      expect(result).toHaveLength(2);
    });
  });
});
