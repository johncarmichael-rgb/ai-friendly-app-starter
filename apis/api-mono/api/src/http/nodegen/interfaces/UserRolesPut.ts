export interface UserRolesPut {
  /**
   * System-level roles for the user. An empty array means a standard user with no system
   * privileges; ['SUPER_ADMIN'] grants full platform admin.
   */
  roles: Role[];
}

export enum Role {
  SuperAdmin = 'SUPER_ADMIN',
}
