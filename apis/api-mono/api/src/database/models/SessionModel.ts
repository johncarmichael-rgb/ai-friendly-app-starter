import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { randomUUID } from 'crypto';

@modelOptions({
  schemaOptions: {
    collection: 'sessions',
    timestamps: true,
  },
})
@index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic cleanup
export class SessionClass {
  @prop({ default: () => randomUUID() })
  _id!: string;

  @prop({ required: true, unique: true })
  sessionId!: string;

  @prop({ required: true, index: true })
  userId!: string;

  @prop({ type: () => [String], required: true, default: [] })
  userRoles!: string[];

  @prop({ required: true })
  expiresAt!: Date;

  @prop()
  ipAddress?: string;

  @prop()
  userAgent?: string;

  @prop()
  lastAccessedAt?: Date;

  @prop({ index: true })
  companyId?: string;

  @prop()
  workosSessionId?: string;

  // Timestamps handled automatically by timestamps: true
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const SessionModel = getModelForClass(SessionClass);
