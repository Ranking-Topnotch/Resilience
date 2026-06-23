import { Schema, model, Document } from 'mongoose';

export interface ICreatorCard extends Document<string> {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  creator_reference: string;
  links: Array<{ title: string; url: string }>;
  service_rates?: {
    currency: 'NGN' | 'USD' | 'GBP' | 'GHS';
    rates: Array<{ name: string; description?: string; amount: number }>;
  };
  status: 'draft' | 'published';
  access_type: 'public' | 'private';
  access_code: string | null;
  created: number;
  updated: number;
  deleted: number | null;
}

const CreatorCardSchema = new Schema<ICreatorCard>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  creator_reference: { type: String, required: true },
  links: [{
    _id: false,
    title: { type: String, required: true },
    url: { type: String, required: true }
  }],
  service_rates: {
    currency: { type: String, enum: ['NGN', 'USD', 'GBP', 'GHS'] },
    rates: [{
      _id: false,
      name: { type: String, required: true },
      description: { type: String, default: '' },
      amount: { type: Number, required: true }
    }]
  },
  status: { type: String, enum: ['draft', 'published'], required: true },
  access_type: { type: String, enum: ['public', 'private'], default: 'public' },
  access_code: { type: String, default: null },
  created: { type: Number, required: true },
  updated: { type: Number, required: true },
  deleted: { type: Number, default: null }
}, {
  versionKey: false,
  // Intercept serialization options to translate _id completely into id across responses
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

export const CreatorCard = model<ICreatorCard>('CreatorCard', CreatorCardSchema);