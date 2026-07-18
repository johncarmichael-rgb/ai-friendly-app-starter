export interface AdminCompanyPut {
  /**
   * Email domains associated with this company. Raw editing is super-admin only; tenants must
   * use the domain-verification flow.
   */
  domains?: string[];
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
