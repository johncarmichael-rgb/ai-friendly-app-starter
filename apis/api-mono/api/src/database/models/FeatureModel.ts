import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { randomUUID } from 'crypto';
import { Feature } from '@/http/nodegen/interfaces';

@modelOptions({
  schemaOptions: {
    collection: 'features',
    timestamps: true,
  },
})
export class FeatureClass implements Feature {
  @prop({ default: () => randomUUID() })
  _id!: string;

  @prop({ required: true, unique: true, index: true })
  code!: string;

  @prop({ required: true })
  name!: string;

  @prop()
  description?: string;

  @prop({ default: true })
  isActive?: boolean;

  @prop({ required: true })
  createdBy!: string;

  // Timestamps handled automatically by timestamps: true
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const FeatureModel = getModelForClass(FeatureClass);
