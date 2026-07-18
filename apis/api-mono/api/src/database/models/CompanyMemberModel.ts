import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { randomUUID } from 'crypto';
import { CompanyMember } from '@/http/nodegen/interfaces';
import { Status } from '@/http/nodegen/interfaces/CompanyMember';

@modelOptions({
  schemaOptions: {
    collection: 'companyMembers',
    timestamps: true,
  },
})
@index({ companyId: 1, userId: 1 })
export class CompanyMemberClass implements CompanyMember {
  @prop({ default: () => randomUUID() })
  _id!: string;

  @prop({ required: true, index: true })
  companyId!: string;

  @prop({ required: true, index: true })
  userId!: string;

  @prop({ required: true })
  role!: string;

  @prop()
  name?: string;

  @prop()
  locationId?: string;

  @prop()
  managerUserId?: string;

  @prop({ required: true })
  status!: Status;

  @prop({ default: false })
  isExternal!: boolean;

  @prop({ required: true })
  invitedBy!: string;

  @prop({ required: true })
  invitedAt!: Date;

  @prop()
  joinedAt?: Date;

  // Timestamps handled automatically by timestamps: true
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const CompanyMemberModel = getModelForClass(CompanyMemberClass);
