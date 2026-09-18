import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  id: string;
  name: string;
  address: string;
  isPanel: boolean;
  type?: 'NABH' | 'non-NABH' | 'Super Speciality';
}

const HospitalSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    isPanel: { type: Boolean, default: true },
    type: { type: String, enum: ['NABH', 'non-NABH', 'Super Speciality'], default: 'NABH' }
  },
  { timestamps: false }
);

export default mongoose.models.Hospital ||
  mongoose.model<IHospital>('Hospital', HospitalSchema);
