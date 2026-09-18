'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CommonProfileForm from '@/components/CommonProfileForm';
import FormSpecificsEditor from '@/components/FormSpecificsEditor';
import FormRenderer from '@/components/FormRenderer';
import { CompleteFormData, CommonProfile } from '@/types/form';

const INITIAL_FORM_DATA: CompleteFormData = {
  profile: {
    employeeName: 'RAJESH KUMAR SHARMA',
    employeeId: '98241',
    employeeCode: 'EC-98241',
    designation: 'Senior Section Officer',
    cardNo: 'DGEHS-DEL-98241',
    placeOfIssue: 'Dispensary Gulabi Bagh, Delhi',
    validFrom: '2024-01-01',
    validTo: '2029-12-31',
    residenceAddress: 'H.No. 402, Block-C, Govt. Officers Colony, Gulabi Bagh, Delhi-110007',
    phoneMobile: '9876543210',
    phoneOffice: '011-23891042',
    phoneRes: '011-27459812',
    email: '98241.rajesh@doe.delhi.gov.in',
    basicPay: '78800',
    payLevel: 'Level 10 (Pay Matrix 56100-177500)',
    entitlement: 'Pvt.',
    status: 'Govt. Servant',
    bankName: 'State Bank of India',
    bankBranch: 'Delhi Secretariat Branch, IP Estate, New Delhi',
    sbAccountNo: '30491823901',
    micrCode: '110002044',
    ifsCode: 'SBIN0000677',
    bankPhone: '011-23392104'
  },
  form1: {
    opdFromDate: '2025-05-10',
    opdToDate: '2025-05-24',
    indoorAdmissionDate: '2025-05-12',
    indoorDischargeDate: '2025-05-18',
    patients: [
      {
        sNo: 1,
        name: 'RAJESH KUMAR SHARMA',
        relation: 'Self',
        hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
        consultationAmount: '1400',
        investigationAmount: '5600',
        medicineAmount: '3200',
        otherAmount: '800',
        claimedAmount: '11000'
      }
    ],
    enclosures: {
      annexure1: true,
      annexure2: true,
      calculationSheet: true,
      medicalCardCopy: true,
      doctorPrescription: true,
      billReceipts: true
    },
    dated: '2025-06-01'
  },
  form2: {
    reimbursementAmount: '11000',
    familyMembers: ['RAJESH KUMAR SHARMA (Self)', '', '', '']
  },
  form3: {
    checklist: {
      revisedMedical2004: 'Yes',
      photocopyCard: 'Yes',
      photocopyReferral: 'Yes',
      originalBills: 'Yes',
      prescriptionOrDischarge: 'Yes',
      breakupLab: 'Yes',
      breakupDrugs: 'Yes',
      emergencyCert: 'Yes',
      emergencyLetter: 'No',
      nonAvailabilityCert: 'No',
      originalLost: 'No',
      claimPapersLost: 'No',
      affidavitLost: 'No',
      deathCardHolder: 'No',
      affidavitDeath: 'No',
      noObjectionHeirs: 'No',
      deathCertificate: 'No'
    },
    dated: '2025-06-01'
  },
  form4: {
    patientName: 'RAJESH KUMAR SHARMA',
    relationship: 'Self',
    hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
    hospitalAddress: '1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi',
    isEmpanelledHospital: true,
    opdTreatmentPeriod: '10-May-2025 to 24-May-2025',
    indoorAdmissionDate: '2025-05-12',
    indoorDischargeDate: '2025-05-18',
    opdTotal: '4500',
    opdConsultation: '700',
    opdInvestigation: '2600',
    opdMedicine: '1200',
    opdOther: '0',
    indoorTotal: '6500',
    indoorConsultation: '700',
    indoorInvestigation: '3000',
    indoorMedicine: '2800',
    indoorOther: '0',
    referralDetails: 'Referred by CMO Dispensary Gulabi Bagh vide Ref No. 9481/2025',
    medicalAdvanceDetails: 'NIL',
    declarationDate: '2025-06-01'
  },
  form5: {
    patientName: 'RAJESH KUMAR SHARMA',
    relationship: 'Self',
    hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
    hospitalType: 'Panel',
    periodFrom: '2025-05-12',
    periodTo: '2025-05-18',
    calcRows: [
      {
        sNo: 1,
        date: '12/05/2025',
        treatmentName: 'Consultation OPD- Super speciality/Psychiatry',
        cghsCode: 'CN003',
        rateCharged: '1000',
        approvedRate: '700',
        restrictedClaim: '700',
        remarks: 'CGHS Approved Rate'
      },
      {
        sNo: 2,
        date: '13/05/2025',
        treatmentName: 'Kidney Function Test (KFT)- (Sr.Creatinine,Blood Urea,BUN,Sr.Uric Acid,Sr.Sodium,Sr.Potassium,Urine R/E)',
        cghsCode: 'LB123',
        rateCharged: '800',
        approvedRate: '500',
        restrictedClaim: '500',
        remarks: 'CGHS Rate'
      }
    ],
    ddoName: 'A. K. VERMA (DDO)',
    hosName: 'DR. S. P. SINGH (HOS)'
  }
};

export default function NewClaimPage() {
  const [formData, setFormData] = useState<CompleteFormData>(INITIAL_FORM_DATA);
  const [step, setStep] = useState<'profile' | 'specifics' | 'preview'>('profile');

  useEffect(() => {
    // Load static profile defaults from MongoDB Atlas if available
    fetch('/api/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          updateProfileData(json.data);
        }
      })
      .catch((e) => console.error('Failed auto-fetching profile', e));
  }, []);

  const updateProfileData = (newProfile: CommonProfile) => {
    setFormData((prev) => ({
      ...prev,
      profile: newProfile,
      form2: {
        ...prev.form2,
        familyMembers: [
          `${newProfile.employeeName} (Self)`,
          prev.form2.familyMembers[1],
          prev.form2.familyMembers[2],
          prev.form2.familyMembers[3]
        ]
      },
      form4: {
        ...prev.form4,
        patientName: prev.form4.patientName || newProfile.employeeName
      },
      form5: {
        ...prev.form5,
        patientName: prev.form5.patientName || newProfile.employeeName
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Sub-Header Step Nav */}
      <div className="no-print border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-[61px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex justify-between items-center text-xs font-semibold">
          <div className="text-slate-400 font-mono">
            New Claim Wizard — Emp ID: <span className="font-bold text-sky-400">{formData.profile.employeeId || '98241'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStep('profile')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                step === 'profile'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Common Info
            </button>
            <button
              onClick={() => setStep('specifics')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                step === 'specifics'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. 5 Forms Specifics
            </button>
            <button
              onClick={() => setStep('preview')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                step === 'preview'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. 5-Page Printable PDF
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {step === 'profile' && (
          <CommonProfileForm
            profile={formData.profile}
            onChange={updateProfileData}
            onNext={() => setStep('specifics')}
          />
        )}

        {step === 'specifics' && (
          <FormSpecificsEditor
            data={formData}
            onChange={(d) => setFormData(d)}
            onBack={() => setStep('profile')}
            onPreview={() => setStep('preview')}
          />
        )}

        {step === 'preview' && (
          <FormRenderer
            data={formData}
            onEdit={() => setStep('specifics')}
          />
        )}
      </main>
    </div>
  );
}
