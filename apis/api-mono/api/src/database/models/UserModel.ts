import { getModelForClass, modelOptions, post, prop } from '@typegoose/typegoose';
import { randomUUID } from 'crypto';
import { User } from '@/http/nodegen/interfaces';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const invalidateUserCache = async (doc: UserClass) => {
  // No-op: app caches are now per-company (not per-user).
  // Company-level invalidation is handled by CompanyMemberModel hooks.
};

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true,
  },
})
@post<UserClass>('save', invalidateUserCache)
@post<UserClass>('findOneAndUpdate', invalidateUserCache)
export class UserClass implements User {
  @prop({ default: () => randomUUID() })
  _id!: string;

  @prop()
  avatar?: string;

  @prop({ required: true })
  createdBy!: string;

  @prop()
  displayName?: string;

  @prop({ required: true, index: true })
  email!: string;

  @prop({ index: true })
  externalId?: string;

  @prop({ required: true })
  firstName!: string;

  @prop({ required: true })
  lastName!: string;

  @prop({ type: () => [String], required: true, default: [] })
  previousEmails!: string[];

  @prop({ type: () => [String], required: true, default: [] })
  roles!: string[];

  // Timestamps handled automatically by timestamps: true
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const UserModel = getModelForClass(UserClass);
