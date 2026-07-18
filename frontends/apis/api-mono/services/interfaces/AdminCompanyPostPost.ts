export interface AdminCompanyPostPost {
  /**
   * Email domains associated with this company (e.g., ['acme.com', 'acme.co.uk']).
   * Super-admin create only; may be empty.
   */
  domains: string[];
  logo?: string;
  name: string;
  roles?: Role[];
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
