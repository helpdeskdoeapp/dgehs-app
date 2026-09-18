import mongoose, { Schema, Document } from 'mongoose';

export interface IRateItem extends Document {
  s_no: number;
  alphanumeric_code: string;
  cghs_treatment_procedure_investigation_list: string;
  speciality_classification: string;
  tier_i_nabh_general_ward: string;
}

const RateItemSchema: Schema = new Schema(
  {
    s_no: { type: Number, required: true },
    alphanumeric_code: { type: String, required: true, index: true },
    cghs_treatment_procedure_investigation_list: { type: String, required: true },
    speciality_classification: { type: String, default: '' },
    tier_i_nabh_general_ward: { type: String, required: true }
  },
  { timestamps: false }
);

RateItemSchema.index({ alphanumeric_code: 'text', cghs_treatment_procedure_investigation_list: 'text' });

export default mongoose.models.RateItem ||
  mongoose.model<IRateItem>('RateItem', RateItemSchema);
