export interface CommonProfile {
  id?: string;
  employeeName: string;
  employeeId: string;
  employeeCode: string;
  designation: string;
  cardNo: string;
  placeOfIssue: string;
  validFrom: string;
  validTo: string;
  residenceAddress: string;
  phoneMobile: string;
  phoneOffice: string;
  phoneRes: string;
  email: string;
  basicPay: string;
  payLevel: string;
  entitlement: 'Pvt.' | 'Semi Pvt.' | 'General' | 'N/A' | string;
  status: 'Govt. Servant' | 'Pensioner' | 'Other';
  bankName: string;
  bankBranch: string;
  sbAccountNo: string;
  micrCode: string;
  ifsCode: string;
  bankPhone: string;
}

export interface DependentProfile {
  id?: string;
  userId?: string;
  name: string;
  relation: 'Self' | 'Wife' | 'Husband' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Other' | string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | string;
}

export interface PatientRow {
  sNo: number;
  included?: boolean;
  name: string;
  relation: string;
  hospitalName: string;
  consultationAmount: string;
  investigationAmount: string;
  medicineAmount: string;
  otherAmount: string;
  claimedAmount: string;
}

export interface Form1Data {
  opdFromDate: string;
  opdToDate: string;
  indoorAdmissionDate: string;
  indoorDischargeDate: string;
  patients: PatientRow[];
  enclosures: {
    annexure1: boolean;
    annexure2: boolean;
    calculationSheet: boolean;
    medicalCardCopy: boolean;
    doctorPrescription: boolean;
    billReceipts: boolean;
  };
  dated: string;
}

export interface Form2Data {
  reimbursementAmount: string;
  familyMembers: [string, string, string, string];
}

export interface Form3Data {
  checklist: {
    revisedMedical2004: 'Yes' | 'No';
    photocopyCard: 'Yes' | 'No';
    photocopyReferral: 'Yes' | 'No';
    originalBills: 'Yes' | 'No';
    prescriptionOrDischarge: 'Yes' | 'No';
    breakupLab: 'Yes' | 'No';
    breakupDrugs: 'Yes' | 'No';
    emergencyCert: 'Yes' | 'No';
    emergencyLetter: 'Yes' | 'No';
    nonAvailabilityCert: 'Yes' | 'No';
    originalLost: 'Yes' | 'No';
    claimPapersLost: 'Yes' | 'No';
    affidavitLost: 'Yes' | 'No';
    deathCardHolder: 'Yes' | 'No';
    affidavitDeath: 'Yes' | 'No';
    noObjectionHeirs: 'Yes' | 'No';
    deathCertificate: 'Yes' | 'No';
  };
  dated: string;
}

export interface Form4Data {
  patientName: string;
  relationship: string;
  hospitalName: string;
  hospitalAddress: string;
  isEmpanelledHospital: boolean;
  opdTreatmentPeriod: string;
  indoorAdmissionDate: string;
  indoorDischargeDate: string;
  opdTotal: string;
  opdConsultation: string;
  opdInvestigation: string;
  opdMedicine: string;
  opdOther: string;
  indoorTotal: string;
  indoorConsultation: string;
  indoorInvestigation: string;
  indoorMedicine: string;
  indoorOther: string;
  referralDetails: string;
  medicalAdvanceDetails: string;
  declarationDate: string;
}

export interface CalcRow {
  sNo: number;
  date: string;
  treatmentName: string;
  cghsCode: string;
  rateCharged: string;
  approvedRate: string;
  restrictedClaim: string;
  remarks: string;
}

export interface Form5Data {
  patientName: string;
  relationship: string;
  hospitalName: string;
  hospitalType: 'Govt.' | 'Panel' | 'Pvt.' | 'Diagonal Center';
  periodFrom: string;
  periodTo: string;
  calcRows: CalcRow[];
  ddoName: string;
  hosName: string;
}

export interface CompleteFormData {
  profile: CommonProfile;
  dependents?: DependentProfile[];
  form1: Form1Data;
  form2: Form2Data;
  form3: Form3Data;
  form4: Form4Data;
  form5: Form5Data;
}

export interface RateItem {
  s_no: string;
  speciality_classification: string;
  alphanumeric_code: string;
  cghs_treatment_procedure_investigation_list: string;
  tier_i_nabh_general_ward: string;
}

export interface HospitalItem {
  id: string;
  name: string;
  address: string;
  isPanel: boolean;
  type?: "NABH" | "non-NABH" | "Super Speciality";
}
