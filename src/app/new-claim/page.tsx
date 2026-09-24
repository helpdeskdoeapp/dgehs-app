'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CommonProfileForm from '@/components/CommonProfileForm';
import FormSpecificsEditor from '@/components/FormSpecificsEditor';
import FormRenderer from '@/components/FormRenderer';
import { CompleteFormData, CommonProfile, DependentProfile, PatientRow } from '@/types/form';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

const DEFAULT_DEPENDENTS: DependentProfile[] = [
  {
    name: 'RAJESH KUMAR SHARMA',
    relation: 'Self',
    dob: '1980-05-15',
    gender: 'Male'
  },
  {
    name: 'SUNITA SHARMA',
    relation: 'Wife',
    dob: '1984-08-20',
    gender: 'Female'
  },
  {
    name: 'ROHAN SHARMA',
    relation: 'Son',
    dob: '2010-11-12',
    gender: 'Male'
  }
];

const INITIAL_FORM_DATA: CompleteFormData = {
  profile: {
    employeeName: 'RAJESH KUMAR SHARMA',
    employeeId: '98241',
    employeeCode: '98241',
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
    payLevel: 'Level 10',
    entitlement: 'Pvt.',
    status: 'Govt. Servant',
    bankName: 'State Bank of India',
    bankBranch: 'Delhi Secretariat Branch, IP Estate, New Delhi',
    sbAccountNo: '30491823901',
    micrCode: '110002044',
    ifsCode: 'SBIN0000677',
    bankPhone: '011-23392104'
  },
  dependents: DEFAULT_DEPENDENTS,
  form1: {
    opdFromDate: '2025-05-10',
    opdToDate: '2025-05-24',
    indoorAdmissionDate: '2025-05-12',
    indoorDischargeDate: '2025-05-18',
    patients: [
      {
        sNo: 1,
        included: true,
        name: 'RAJESH KUMAR SHARMA',
        relation: 'Self',
        hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
        consultationAmount: '1400',
        investigationAmount: '5600',
        medicineAmount: '3200',
        otherAmount: '800',
        claimedAmount: '11000'
      },
      {
        sNo: 2,
        included: false,
        name: 'SUNITA SHARMA',
        relation: 'Wife',
        hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
        consultationAmount: '0',
        investigationAmount: '0',
        medicineAmount: '0',
        otherAmount: '0',
        claimedAmount: '0'
      },
      {
        sNo: 3,
        included: false,
        name: 'ROHAN SHARMA',
        relation: 'Son',
        hospitalName: 'Max Super Speciality Hospital, Saket, New Delhi',
        consultationAmount: '0',
        investigationAmount: '0',
        medicineAmount: '0',
        otherAmount: '0',
        claimedAmount: '0'
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
      photocopyReferral: 'No',
      originalBills: 'Yes',
      prescriptionOrDischarge: 'Yes',
      breakupLab: 'No',
      breakupDrugs: 'Yes',
      emergencyCert: 'No',
      emergencyLetter: 'No',
      nonAvailabilityCert: 'Yes',
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
    opdTotal: '11000',
    opdConsultation: '1400',
    opdInvestigation: '5600',
    opdMedicine: '3200',
    opdOther: '800',
    indoorTotal: '0',
    indoorConsultation: '0',
    indoorInvestigation: '0',
    indoorMedicine: '0',
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

const normalizeRelations = (fd: CompleteFormData): CompleteFormData => {
  if (!fd) return fd;
  const mapRel = (r?: string) => (r && r.trim().toLowerCase() === 'spouse' ? 'Wife' : (r || ''));
  return {
    ...fd,
    dependents: (fd.dependents || []).map((d) => ({
      ...d,
      relation: mapRel(d.relation)
    })),
    form1: {
      ...fd.form1,
      patients: (fd.form1?.patients || []).map((p) => ({
        ...p,
        relation: mapRel(p.relation)
      }))
    },
    form2: {
      ...fd.form2,
      familyMembers: (fd.form2?.familyMembers || ['', '', '', '']).map((fm) =>
        fm ? fm.replace(/\(Spouse\)/gi, '(Wife)') : ''
      ) as [string, string, string, string]
    },
    form4: {
      ...fd.form4,
      relationship: mapRel(fd.form4?.relationship)
    },
    form5: {
      ...fd.form5,
      relationship: mapRel(fd.form5?.relationship)
    }
  };
};

export default function NewClaimPage() {
  const [formData, setFormData] = useState<CompleteFormData>(INITIAL_FORM_DATA);
  const [step, setStep] = useState<'profile' | 'specifics' | 'preview'>('profile');
  const [claimId, setClaimId] = useState<string>(() => `claim_${Date.now()}`);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      let draftLoaded = false;

      // 1. Try loading existing draft from DB
      try {
        const claimsRes = await fetch('/api/user/claims');
        const claimsJson = await claimsRes.json();
        if (claimsJson.success && claimsJson.data && claimsJson.data.length > 0) {
          const latestDraft = claimsJson.data.find((c: any) => c.status === 'DRAFT') || claimsJson.data[0];
          if (latestDraft && latestDraft.formData) {
            const normalized = normalizeRelations(latestDraft.formData);
            setFormData(normalized);
            if (latestDraft.id || latestDraft._id) {
              setClaimId(latestDraft.id || latestDraft._id);
            }
            draftLoaded = true;
          }
        }
      } catch (e) {
        console.error('Failed fetching user claims from DB', e);
      }

      // 2. Fallback to localStorage draft if not in DB
      if (!draftLoaded && typeof window !== 'undefined') {
        const local = localStorage.getItem('dgehs_claim_draft');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed && parsed.formData) {
              const normalized = normalizeRelations(parsed.formData);
              setFormData(normalized);
              if (parsed.claimId) setClaimId(parsed.claimId);
              draftLoaded = true;
            }
          } catch (e) {
            console.error('Error parsing local draft', e);
          }
        }
      }

      // 3. Fetch latest profile
      try {
        const profRes = await fetch('/api/profile');
        const profJson = await profRes.json();
        if (profJson.success && profJson.data) {
          if (!draftLoaded) {
            updateProfileData(profJson.data);
          }
        }
      } catch (e) {
        console.error('Failed fetching profile', e);
      }

      // 4. Fetch dependents and prefill table if fresh form
      try {
        const depsRes = await fetch('/api/profile/dependents');
        const depsJson = await depsRes.json();
        if (depsJson.success && depsJson.data && depsJson.data.length > 0) {
          const loadedDeps: DependentProfile[] = depsJson.data;

          setFormData((prev) => {
            // If the patient table is empty or fresh, pre-populate all dependents with Self checked
            if (!draftLoaded || !prev.form1.patients || prev.form1.patients.length === 0) {
              const prefilledPatientRows: PatientRow[] = loadedDeps.map((dep, idx) => ({
                sNo: idx + 1,
                included: idx === 0 || dep.relation === 'Self',
                name: dep.name,
                relation: dep.relation,
                hospitalName: prev.form4.hospitalName || 'Max Super Speciality Hospital, Saket, New Delhi',
                consultationAmount: idx === 0 ? '1400' : '0',
                investigationAmount: idx === 0 ? '5600' : '0',
                medicineAmount: idx === 0 ? '3200' : '0',
                otherAmount: idx === 0 ? '800' : '0',
                claimedAmount: idx === 0 ? '11000' : '0'
              }));

              return {
                ...prev,
                dependents: loadedDeps,
                form1: {
                  ...prev.form1,
                  patients: prefilledPatientRows
                }
              };
            }

            return {
              ...prev,
              dependents: loadedDeps
            };
          });
        }
      } catch (e) {
        console.error('Failed fetching dependents', e);
      }
    };

    loadInitialData();
  }, []);

  const updateProfileData = (newProfile: CommonProfile) => {
    setFormData((prev) => {
      const updatedPatients = prev.form1.patients.map((p) =>
        p.relation === 'Self' ? { ...p, name: newProfile.employeeName } : p
      );

      const activePatients = updatedPatients.filter((p) => p.included !== false);

      return {
        ...prev,
        profile: newProfile,
        form1: {
          ...prev.form1,
          patients: updatedPatients
        },
        form2: {
          ...prev.form2,
          familyMembers: [
            activePatients[0] ? `${activePatients[0].name} (${activePatients[0].relation})` : `${newProfile.employeeName} (Self)`,
            activePatients[1] ? `${activePatients[1].name} (${activePatients[1].relation})` : prev.form2.familyMembers[1],
            activePatients[2] ? `${activePatients[2].name} (${activePatients[2].relation})` : prev.form2.familyMembers[2],
            activePatients[3] ? `${activePatients[3].name} (${activePatients[3].relation})` : prev.form2.familyMembers[3]
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
      };
    });
  };

  const handleSaveClaim = async (dataToSave?: CompleteFormData) => {
    const data = normalizeRelations(dataToSave || formData);
    setIsSaving(true);
    try {
      // 1. Save to localStorage for instant browser offline resilience
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'dgehs_claim_draft',
          JSON.stringify({
            claimId,
            formData: data,
            savedAt: new Date().toISOString()
          })
        );
      }

      // 2. Save profile
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.profile)
      }).catch((e) => console.error('Error auto-updating profile on save', e));

      // 3. Save claim to Neon PostgreSQL
      const title = `Medical Claim - ${data.form4.patientName || data.profile.employeeName || 'Draft'} (${new Date().toLocaleDateString()})`;
      const res = await fetch('/api/user/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          title,
          status: 'DRAFT',
          formData: data
        })
      });

      const json = await res.json();
      if (json.success) {
        if (json.data?.id) {
          setClaimId(json.data.id);
        }
        showSuccessAlert(
          'Claim Saved to Database',
          'Your claim progress has been saved. Even if you log out and log back in, all your details will be prefilled automatically!'
        );
      } else {
        showSuccessAlert(
          'Draft Saved Locally',
          'Your half-filled claim form has been saved to your browser session. Sign in to sync across devices.'
        );
      }
    } catch (e) {
      console.error('Error saving claim draft', e);
      showSuccessAlert('Saved Locally', 'Claim details saved to your local browser session.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Sub-Header Step Nav */}
      <div className="no-print border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-[61px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStep('profile')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${step === 'profile'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              1. Common Info
            </button>
            <button
              onClick={() => setStep('specifics')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${step === 'specifics'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              2. 5 Forms Specifics
            </button>
            <button
              onClick={() => setStep('preview')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${step === 'preview'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              3. 5-Page Printable PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveClaim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{isSaving ? '⏳' : '💾'}</span>
              <span>{isSaving ? 'Saving to DB...' : 'Save Claim Progress'}</span>
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
            onSave={() => handleSaveClaim()}
            isSaving={isSaving}
          />
        )}

        {step === 'specifics' && (
          <FormSpecificsEditor
            data={formData}
            onChange={(d) => setFormData(d)}
            onBack={() => setStep('profile')}
            onPreview={() => setStep('preview')}
            onSave={() => handleSaveClaim()}
            isSaving={isSaving}
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
