import { getModelForClass, modelOptions, pre, prop } from '@typegoose/typegoose';
import { randomUUID } from 'crypto';
import { Company, Role } from '@/http/nodegen/interfaces/Company';
import { DEFAULT_COMPANY_ADMIN_ROLE, DEFAULT_COMPANY_MEMBER_ROLE } from '@/constants/ROLES';

/**
 * Role class for Typegoose
 * Represents a user role within a company
 */
export class RoleClass implements Role {
  @prop({ required: true })
  name!: string;

  @prop({ required: false })
  description?: string;

  @prop({ type: () => [String], default: [] })
  permissionGroups?: string[];
}

/**
 * Ensure ADMIN role exists and sort roles alphabetically by name
 * Handles undefined/null by initializing with default admin role
 */
function sortRolesEnsureAdmin(roles: RoleClass[] | undefined): RoleClass[] {
  const rolesArray = roles && roles.length > 0 ? roles : [DEFAULT_COMPANY_ADMIN_ROLE];

  if (!rolesArray.find((role) => role.name === DEFAULT_COMPANY_ADMIN_ROLE.name)) {
    rolesArray.push(DEFAULT_COMPANY_ADMIN_ROLE);
  }

  if (!rolesArray.find((role) => role.name === DEFAULT_COMPANY_MEMBER_ROLE.name)) {
    rolesArray.push(DEFAULT_COMPANY_MEMBER_ROLE);
  }

  rolesArray.sort((a, b) => a.name.localeCompare(b.name));

  return rolesArray;
}

@pre<CompanyClass>('save', function () {
  this.roles = sortRolesEnsureAdmin(this.roles);
})
@pre<CompanyClass>('findOneAndUpdate', function (this: any) {
  const update = this.getUpdate();
  if (update?.roles && Array.isArray(update.roles)) {
    update.roles = sortRolesEnsureAdmin(update.roles);
  }
  if (update?.$set?.roles && Array.isArray(update.$set.roles)) {
    update.$set.roles = sortRolesEnsureAdmin(update.$set.roles);
  }
})
@modelOptions({
  schemaOptions: {
    collection: 'companies',
    timestamps: true,
  },
})
export class CompanyClass implements Company {
  @prop({ default: () => randomUUID() })
  _id!: string;

  @prop({ required: true })
  createdBy!: string;

  @prop()
  logo?: string;

  @prop({ required: true, index: true })
  name!: string;

  @prop({ type: () => [String], required: true, index: true })
  domains!: string[];

  @prop({ type: () => [RoleClass], default: [DEFAULT_COMPANY_ADMIN_ROLE] })
  roles!: RoleClass[];

  @prop({ type: () => [String], default: [] })
  featureCodes?: string[];

  // Timestamps handled automatically by timestamps: true
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const CompanyModel = getModelForClass(CompanyClass);
