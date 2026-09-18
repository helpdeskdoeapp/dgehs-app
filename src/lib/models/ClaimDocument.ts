import mongoose, { Schema, Document } from 'mongoose';
import { CompleteFormData } from '@/types/form';

export interface IClaimDocument extends Document {
  userEmail: string;
  title: string;
  status: 'DRAFT' | 'SUBMITTED';
  formData: CompleteFormData;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimDocumentSchema: Schema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED'], default: 'DRAFT' },
    formData: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.ClaimDocument ||
  mongoose.model<IClaimDocument>('ClaimDocument', ClaimDocumentSchema);
