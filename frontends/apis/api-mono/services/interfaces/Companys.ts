export type Companys = Company[];

export interface Company {
  _id: string;
  createdAt: Date;
  createdBy: string;
  /**
   * Verified email domains associated with this company (e.g., ['acme.com']). Added only via
   * the domain-verification flow (or super-admin endpoints); may be empty for self-serve
   * companies on consumer email providers.
   */
  domains: string[];
  /**
   * Feature codes assigned to this company (managed via admin endpoints only)
   */
  featureCodes?: string[];
  logo?: string;
  name: string;
  roles?: Role[];
  updatedAt: Date;
}

export interface Role {
  /**
   * Optional description of the role's purpose and permissions
   */
  description?: string;
  /**
   * Display name of the role
   */
  name: string;
  /**
   * List of permission group names granted to this role. Groups are defined by the system
   * owner and contain multiple individual permissions.
   */
  permissionGroups?: string[];
}
