import mongoose, { Schema, Document } from 'mongoose';
import { CommonProfile } from '@/types/form';

export interface IUserProfile extends Document, CommonProfile {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    employeeCode: { type: String, default: '' },
    designation: { type: String, default: '' },
    cardNo: { type: String, default: '' },
    placeOfIssue: { type: String, default: '' },
    validFrom: { type: String, default: '' },
    validTo: { type: String, default: '' },
    residenceAddress: { type: String, default: '' },
    phoneMobile: { type: String, default: '' },
    phoneOffice: { type: String, default: '' },
    phoneRes: { type: String, default: '' },
    emailContact: { type: String, default: '' },
    basicPay: { type: String, default: '' },
    payLevel: { type: String, default: '' },
    entitlement: { type: String, default: 'Pvt.' },
    status: { type: String, default: 'Govt. Servant' },
    bankName: { type: String, default: '' },
    bankBranch: { type: String, default: '' },
    sbAccountNo: { type: String, default: '' },
    micrCode: { type: String, default: '' },
    ifsCode: { type: String, default: '' },
    bankPhone: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
