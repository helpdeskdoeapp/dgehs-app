'use client';

import React, { useState } from 'react';
import { CompleteFormData, CalcRow, PatientRow } from '@/types/form';
import CGHSCodePicker from './CGHSCodePicker';
import HospitalPicker from './HospitalPicker';
import DatePicker from './DatePicker';

interface FormSpecificsEditorProps {
  data: CompleteFormData;
  onChange: (data: CompleteFormData) => void;
  onBack: () => void;
  onPreview: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function FormSpecificsEditor({
  data,
  onChange,
  onBack,
  onPreview,
  onSave,
  isSaving
}: FormSpecificsEditorProps) {
  const [activeFormTab, setActiveFormTab] = useState<1 | 3 | 4 | 5>(1);

  // Active (checked) patients filter
  const activePatients = data.form1.patients.filter((p) => p.included !== false);

  const calculateTotalReimbursement = (patients: PatientRow[]): string => {
    const total = patients
      .filter((p) => p.included !== false)
      .reduce((sum, p) => {
        const val = parseFloat(p.claimedAmount);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    return total > 0 ? total.toString() : '0';
  };

  const applyPatientUpdates = (updatedPatients: PatientRow[]) => {
    const checkedPatients = updatedPatients.filter((p) => p.included !== false);
    const totalAmount = calculateTotalReimbursement(updatedPatients);

    const consultationSum = checkedPatients.reduce(
      (sum, p) => sum + (parseFloat(p.consultationAmount) || 0),
      0
    );
    const investigationSum = checkedPatients.reduce(
      (sum, p) => sum + (parseFloat(p.investigationAmount) || 0),
      0
    );
    const medicineSum = checkedPatients.reduce(
      (sum, p) => sum + (parseFloat(p.medicineAmount) || 0),
      0
    );
    const otherSum = checkedPatients.reduce(
      (sum, p) => sum + (parseFloat(p.otherAmount) || 0),
      0
    );

    const famMembers: [string, string, string, string] = [
      checkedPatients[0] ? `${checkedPatients[0].name} (${checkedPatients[0].relation})` : '',
      checkedPatients[1] ? `${checkedPatients[1].name} (${checkedPatients[1].relation})` : '',
      checkedPatients[2] ? `${checkedPatients[2].name} (${checkedPatients[2].relation})` : '',
      checkedPatients[3] ? `${checkedPatients[3].name} (${checkedPatients[3].relation})` : ''
    ];

    let newForm4Patient = data.form4.patientName;
    let newForm4Rel = data.form4.relationship;
    let newForm5Patient = data.form5.patientName;
    let newForm5Rel = data.form5.relationship;

    const checkedNames = checkedPatients.map((p) => p.name.trim().toLowerCase());
    if (checkedPatients.length > 0 && (!newForm4Patient || !checkedNames.includes(newForm4Patient.trim().toLowerCase()))) {
      newForm4Patient = checkedPatients[0].name;
      newForm4Rel = checkedPatients[0].relation;
    } else if (checkedPatients.length === 0 && updatedPatients.length > 0) {
      newForm4Patient = updatedPatients[0].name;
      newForm4Rel = updatedPatients[0].relation;
    }

    if (checkedPatients.length > 0 && (!newForm5Patient || !checkedNames.includes(newForm5Patient.trim().toLowerCase()))) {
      newForm5Patient = checkedPatients[0].name;
      newForm5Rel = checkedPatients[0].relation;
    } else if (checkedPatients.length === 0 && updatedPatients.length > 0) {
      newForm5Patient = updatedPatients[0].name;
      newForm5Rel = updatedPatients[0].relation;
    }

    onChange({
      ...data,
      form1: {
        ...data.form1,
        patients: updatedPatients
      },
      form2: {
        ...data.form2,
        reimbursementAmount: totalAmount,
        familyMembers: famMembers
      },
      form4: {
        ...data.form4,
        patientName: newForm4Patient,
        relationship: newForm4Rel,
        opdConsultation: consultationSum.toString(),
        opdInvestigation: investigationSum.toString(),
        opdMedicine: medicineSum.toString(),
        opdOther: otherSum.toString(),
        opdTotal: totalAmount
      },
      form5: {
        ...data.form5,
        patientName: newForm5Patient,
        relationship: newForm5Rel
      }
    });
  };

  // Toggle single patient inclusion checkbox
  const handleTogglePatientInclusion = (index: number) => {
    const updated = [...data.form1.patients];
    const currentStatus = updated[index].included !== false;
    updated[index] = {
      ...updated[index],
      included: !currentStatus
    };
    applyPatientUpdates(updated);
  };

  // Check all patients
  const handleSelectAllPatients = () => {
    const updated = data.form1.patients.map((p) => ({ ...p, included: true }));
    applyPatientUpdates(updated);
  };

  // Uncheck all patients
  const handleDeselectAllPatients = () => {
    const updated = data.form1.patients.map((p) => ({ ...p, included: false }));
    applyPatientUpdates(updated);
  };

  // Add new patient row directly into the table
  const handleAddPatientRow = () => {
    const newPatient: PatientRow = {
      sNo: data.form1.patients.length + 1,
      included: true,
      name: '',
      relation: 'Self',
      hospitalName: data.form4.hospitalName || data.form5.hospitalName || 'Max Super Speciality Hospital, Saket, New Delhi',
      consultationAmount: '0',
      investigationAmount: '0',
      medicineAmount: '0',
      otherAmount: '0',
      claimedAmount: '0'
    };
    const updated = [...data.form1.patients, newPatient].map((p, idx) => ({ ...p, sNo: idx + 1 }));
    applyPatientUpdates(updated);
  };

  const handlePatientRowFieldChange = (
    idx: number,
    field: 'name' | 'relation' | 'hospitalName' | 'consultationAmount' | 'investigationAmount' | 'medicineAmount' | 'otherAmount' | 'claimedAmount',
    val: string
  ) => {
    const updated = [...data.form1.patients];
    const row = { ...updated[idx], [field]: val };

    // Auto calculate claimed amount if sub-amounts change
    if (['consultationAmount', 'investigationAmount', 'medicineAmount', 'otherAmount'].includes(field)) {
      const c = parseFloat(field === 'consultationAmount' ? val : row.consultationAmount) || 0;
      const i = parseFloat(field === 'investigationAmount' ? val : row.investigationAmount) || 0;
      const m = parseFloat(field === 'medicineAmount' ? val : row.medicineAmount) || 0;
      const o = parseFloat(field === 'otherAmount' ? val : row.otherAmount) || 0;
      const sum = c + i + m + o;
      row.claimedAmount = sum > 0 ? sum.toString() : row.claimedAmount;
    }

    updated[idx] = row;
    applyPatientUpdates(updated);
  };

  const handleRemovePatientRow = (idx: number) => {
    const filtered = data.form1.patients.filter((_, i) => i !== idx);
    const reindexed = filtered.map((p, i) => ({ ...p, sNo: i + 1 }));
    applyPatientUpdates(reindexed);
  };

  const updateForm1 = (updater: (prev: typeof data.form1) => typeof data.form1) => {
    onChange({ ...data, form1: updater(data.form1) });
  };

  const updateForm3 = (updater: (prev: typeof data.form3) => typeof data.form3) => {
    onChange({ ...data, form3: updater(data.form3) });
  };

  const updateForm4 = (updater: (prev: typeof data.form4) => typeof data.form4) => {
    onChange({ ...data, form4: updater(data.form4) });
  };

  const updateForm5 = (updater: (prev: typeof data.form5) => typeof data.form5) => {
    onChange({ ...data, form5: updater(data.form5) });
  };

  const handleAddCalcRow = () => {
    updateForm5((prev) => {
      const newRow: CalcRow = {
        sNo: prev.calcRows.length + 1,
        date: '',
        treatmentName: '',
        cghsCode: '',
        rateCharged: '',
        approvedRate: '',
        restrictedClaim: '',
        remarks: ''
      };
      return { ...prev, calcRows: [...prev.calcRows, newRow] };
    });
  };

  const handleRemoveCalcRow = (index: number) => {
    updateForm5((prev) => {
      const filtered = prev.calcRows.filter((_, i) => i !== index);
      const reindexed = filtered.map((r, i) => ({ ...r, sNo: i + 1 }));
      return { ...prev, calcRows: reindexed };
    });
  };

  const handleCalcRowChange = (index: number, field: keyof CalcRow, val: string) => {
    updateForm5((prev) => {
      const updated = [...prev.calcRows];
      const row = { ...updated[index], [field]: val };

      if (field === 'rateCharged' || field === 'approvedRate') {
        const chargedNum = parseFloat(field === 'rateCharged' ? val : row.rateCharged);
        const approvedNum = parseFloat(field === 'approvedRate' ? val : row.approvedRate);
        if (!isNaN(chargedNum) && !isNaN(approvedNum)) {
          row.restrictedClaim = Math.min(chargedNum, approvedNum).toString();
        } else if (!isNaN(approvedNum)) {
          row.restrictedClaim = approvedNum.toString();
        }
      }

      updated[index] = row;
      return { ...prev, calcRows: updated };
    });
  };

  const grandTotalClaimed = calculateTotalReimbursement(data.form1.patients);
  const checkedCount = activePatients.length;

  const calcChargedTotal = data.form5.calcRows.reduce(
    (sum, r) => sum + (parseFloat(r.rateCharged) || 0),
    0
  );
  const calcApprovedTotal = data.form5.calcRows.reduce(
    (sum, r) => sum + (parseFloat(r.approvedRate) || 0),
    0
  );
  const calcRestrictedTotal = data.form5.calcRows.reduce(
    (sum, r) => sum + (parseFloat(r.restrictedClaim) || 0),
    0
  );

  const renderSaveButton = (label = 'Save Progress') => {
    if (!onSave) return null;
    return (
      <button
        type="button"
        disabled={isSaving}
        onClick={onSave}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        title="Save progress to database"
      >
        <span>{isSaving ? '⏳' : '💾'}</span>
        <span>{isSaving ? 'Saving...' : label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Tabs Bar with Save Button */}
      <div className="bg-slate-900 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg text-white">
        <div className="flex flex-wrap gap-1.5 flex-1 text-xs font-semibold">
          {([
            { num: 1, label: 'Form 1: Application Form' },
            { num: 3, label: 'Form 3: Annexure-I' },
            { num: 4, label: 'Form 4: Annexure-II' },
            { num: 5, label: 'Form 5: Calculation Sheet' }
          ] as const).map((tab) => (
            <button
              key={tab.num}
              type="button"
              onClick={() => setActiveFormTab(tab.num)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeFormTab === tab.num
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {tab.num}
              </span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="pl-2 border-l border-slate-800 hidden sm:block">
          {renderSaveButton('Save Draft to DB')}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ============ FORM 1: APPLICATION FORM EDITOR ============ */}
      {/* ======================================================== */}
      {activeFormTab === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-base font-bold text-sky-950 flex items-center gap-2">
                <span>📋</span> Form 1: Medical Application Form Specifics
              </h3>
              <p className="text-xs text-slate-500">
                Configure treatment periods and select which dependents to claim using the table checkboxes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderSaveButton('Save Form 1')}
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full w-fit">
                Form 1 of 5
              </span>
            </div>
          </div>

          {/* Treatment Periods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span> 5. OPD Treatment Period
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">From Date</label>
                  <DatePicker
                    value={data.form1.opdFromDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, opdFromDate: val }))}
                    placeholder="From Date..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">To Date</label>
                  <DatePicker
                    value={data.form1.opdToDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, opdToDate: val }))}
                    placeholder="To Date..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 6. Indoor Treatment Period
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Date of Admission</label>
                  <DatePicker
                    value={data.form1.indoorAdmissionDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, indoorAdmissionDate: val }))}
                    placeholder="Admission..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Date of Discharge</label>
                  <DatePicker
                    value={data.form1.indoorDischargeDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, indoorDischargeDate: val }))}
                    placeholder="Discharge..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 7. PATIENT CLAIM SUMMARY TABLE (WITH IN-TABLE CHECKBOX)   */}
          {/* ======================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>7. Patient Claim Summary Table (Prefilled from Dependents)</span>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {checkedCount} of {data.form1.patients.length} Checked
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check the box for each patient/dependent included in this claim. Only checked dependents are included in the claim total, Form 2 undertaking, and printout.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPatients}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
                >
                  Check All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllPatients}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
                >
                  Uncheck All
                </button>
                <button
                  type="button"
                  onClick={handleAddPatientRow}
                  className="px-3 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>+</span> Add Row
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-xs border-collapse text-slate-900">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 text-center w-12" title="Include in claim">
                      Claim?
                    </th>
                    <th className="p-2.5 text-center w-10">S.N</th>
                    <th className="p-2.5 text-left min-w-[150px]">Patient Name</th>
                    <th className="p-2.5 text-left w-28">Relation</th>
                    <th className="p-2.5 text-left min-w-[180px]">Hospital Name</th>
                    <th className="p-2.5 text-right w-24">Consultation (₹)</th>
                    <th className="p-2.5 text-right w-24">Investigation (₹)</th>
                    <th className="p-2.5 text-right w-24">Medicine (₹)</th>
                    <th className="p-2.5 text-right w-24">Other (₹)</th>
                    <th className="p-2.5 text-right w-28">Claimed Total (₹)</th>
                    <th className="p-2.5 text-center w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.form1.patients.map((pat, idx) => {
                    const isChecked = pat.included !== false;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${isChecked ? 'bg-white hover:bg-sky-50/30' : 'bg-slate-50/80 opacity-60 hover:opacity-90'
                          }`}
                      >
                        {/* Checkbox Column */}
                        <td className="p-2 text-center bg-slate-50/50">
                          <label className="flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePatientInclusion(idx)}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                            />
                          </label>
                        </td>

                        <td className="p-2 text-center font-bold text-slate-500 bg-slate-50/30">
                          {pat.sNo || idx + 1}
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.name}
                            onChange={(e) => handlePatientRowFieldChange(idx, 'name', e.target.value.toUpperCase())}
                            placeholder="Patient name..."
                            className="w-full p-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 uppercase"
                          />
                        </td>

                        <td className="p-2">
                          <select
                            value={pat.relation}
                            onChange={(e) => handlePatientRowFieldChange(idx, 'relation', e.target.value)}
                            className="w-full p-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded"
                          >
                            <option value="Self">Self</option>
                            <option value="Wife">Wife</option>
                            <option value="Husband">Husband</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.hospitalName}
                            onChange={(e) => handlePatientRowFieldChange(idx, 'hospitalName', e.target.value)}
                            placeholder="Hospital Name..."
                            className="w-full p-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.consultationAmount}
                            onChange={(e) =>
                              handlePatientRowFieldChange(
                                idx,
                                'consultationAmount',
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="0"
                            className="w-full p-1.5 text-xs text-right text-slate-900 bg-white border border-slate-300 rounded"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.investigationAmount}
                            onChange={(e) =>
                              handlePatientRowFieldChange(
                                idx,
                                'investigationAmount',
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="0"
                            className="w-full p-1.5 text-xs text-right text-slate-900 bg-white border border-slate-300 rounded"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.medicineAmount}
                            onChange={(e) =>
                              handlePatientRowFieldChange(
                                idx,
                                'medicineAmount',
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="0"
                            className="w-full p-1.5 text-xs text-right text-slate-900 bg-white border border-slate-300 rounded"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.otherAmount}
                            onChange={(e) =>
                              handlePatientRowFieldChange(
                                idx,
                                'otherAmount',
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="0"
                            className="w-full p-1.5 text-xs text-right text-slate-900 bg-white border border-slate-300 rounded"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={pat.claimedAmount}
                            onChange={(e) =>
                              handlePatientRowFieldChange(
                                idx,
                                'claimedAmount',
                                e.target.value.replace(/\D/g, '')
                              )
                            }
                            placeholder="0"
                            className={`w-full p-1.5 text-xs text-right font-bold border rounded ${isChecked
                              ? 'text-emerald-800 bg-emerald-50/60 border-emerald-300'
                              : 'text-slate-400 bg-slate-100 border-slate-300'
                              }`}
                          />
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePatientRow(idx)}
                            title="Delete Row"
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                    <td colSpan={5} className="p-2.5 text-right font-bold text-slate-700">
                      Total for Checked Patients ({checkedCount}):
                    </td>
                    <td className="p-2 text-right">
                      ₹
                      {activePatients.reduce(
                        (sum, p) => sum + (parseFloat(p.consultationAmount) || 0),
                        0
                      )}
                    </td>
                    <td className="p-2 text-right">
                      ₹
                      {activePatients.reduce(
                        (sum, p) => sum + (parseFloat(p.investigationAmount) || 0),
                        0
                      )}
                    </td>
                    <td className="p-2 text-right">
                      ₹
                      {activePatients.reduce(
                        (sum, p) => sum + (parseFloat(p.medicineAmount) || 0),
                        0
                      )}
                    </td>
                    <td className="p-2 text-right">
                      ₹
                      {activePatients.reduce(
                        (sum, p) => sum + (parseFloat(p.otherAmount) || 0),
                        0
                      )}
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-800 bg-emerald-100/60">
                      ₹{grandTotalClaimed}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Form 1 Checklist Enclosures & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Declaration Date
              </label>
              <DatePicker
                value={data.form1.dated}
                onChange={(val) => updateForm1((p) => ({ ...p, dated: val }))}
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700">Official Auto-Synchronized Items:</span>
              <p className="text-slate-600 text-[11px]">
                Form 2 (Undertaking) automatically contains checked patients:{' '}
                <strong>
                  {activePatients.map((p) => `${p.name} (${p.relation})`).join(', ') || 'None selected'}
                </strong>{' '}
                with total claimed sum <strong>₹{grandTotalClaimed}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ============ FORM 3: ANNEXURE-I CHECKLIST EDITOR ======= */}
      {/* ======================================================== */}
      {activeFormTab === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 3: Annexure-I Document Checklist</h3>
              <p className="text-xs text-slate-500">Tick submitted documents (Yes/No)</p>
            </div>
            <div className="flex items-center gap-2">
              {renderSaveButton('Save Annexure-I')}
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                Form 3 of 5
              </span>
            </div>
          </div>

          <div className="mb-4 max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Checklist Date</label>
            <DatePicker
              value={data.form3.dated}
              onChange={(val) => updateForm3((p) => ({ ...p, dated: val }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { key: 'revisedMedical2004', label: '(a) Revised Medical 2004 Form' },
              { key: 'photocopyCard', label: '(b) Photocopy of DGEHS Card showing validity' },
              { key: 'photocopyReferral', label: '(c) Photocopy of Referral / Authorization form AMA' },
              { key: 'originalBills', label: '(d) Original Bills' },
              { key: 'prescriptionOrDischarge', label: '(e) Copy of prescription for OPD / Discharge Summary for Indoor' },
              { key: 'breakupLab', label: '(f) Breakup for Lab Investigation' },
              { key: 'breakupDrugs', label: '(g) Breakup of Drugs prescribed' },
              { key: 'emergencyCert', label: '(h) Emergency Certificate from Hospital Empanelled/Registered' },
              { key: 'emergencyLetter', label: '(i) Self explanatory letter showing need of emergency visit' },
              { key: 'nonAvailabilityCert', label: '(j) Non Availability Certificate from AMA' }
            ].map((item) => (
              <div key={item.key} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-xl">
                <span className="text-slate-700 font-medium">{item.label}</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 cursor-pointer text-slate-900">
                    <input
                      type="radio"
                      name={item.key}
                      value="Yes"
                      checked={data.form3.checklist[item.key as keyof typeof data.form3.checklist] === 'Yes'}
                      onChange={() =>
                        updateForm3((p) => ({
                          ...p,
                          checklist: { ...p.checklist, [item.key]: 'Yes' }
                        }))
                      }
                      className="accent-sky-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-900">
                    <input
                      type="radio"
                      name={item.key}
                      value="No"
                      checked={data.form3.checklist[item.key as keyof typeof data.form3.checklist] === 'No'}
                      onChange={() =>
                        updateForm3((p) => ({
                          ...p,
                          checklist: { ...p.checklist, [item.key]: 'No' }
                        }))
                      }
                      className="accent-sky-600"
                    />
                    No
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ============ FORM 4: ANNEXURE-II MEDICAL 2004 ========== */}
      {/* ======================================================== */}
      {activeFormTab === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 4: Annexure-II Medical 2004 Specifics</h3>
              <p className="text-xs text-slate-500">Hospital selection, breakdown of claimed amounts, &amp; referral details</p>
            </div>
            <div className="flex items-center gap-2">
              {renderSaveButton('Save Annexure-II')}
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                Form 4 of 5
              </span>
            </div>
          </div>

          {/* Quick Patient Switcher from Checked Dependents */}
          {activePatients.length > 0 && (
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-sky-900">
                Choose Patient from Checked Dependents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePatients.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateForm4((prev) => ({
                        ...prev,
                        patientName: p.name,
                        relationship: p.relation,
                        opdConsultation: p.consultationAmount || prev.opdConsultation,
                        opdInvestigation: p.investigationAmount || prev.opdInvestigation,
                        opdMedicine: p.medicineAmount || prev.opdMedicine,
                        opdOther: p.otherAmount || prev.opdOther
                      }));
                      updateForm5((prev) => ({
                        ...prev,
                        patientName: p.name,
                        relationship: p.relation
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${data.form4.patientName === p.name
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {p.name} ({p.relation})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={data.form4.patientName}
                onChange={(e) => updateForm4((p) => ({ ...p, patientName: e.target.value.toUpperCase() }))}
                placeholder="Patient full name..."
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship with Card Holder</label>
              <input
                type="text"
                value={data.form4.relationship}
                onChange={(e) => updateForm4((p) => ({ ...p, relationship: e.target.value }))}
                placeholder="e.g. Self, Wife, Son, Daughter..."
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Hospital Selector */}
          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
            <HospitalPicker
              value={data.form4.hospitalName}
              addressValue={data.form4.hospitalAddress}
              isEmpanelled={data.form4.isEmpanelledHospital}
              onChange={({ hospitalName, address, isEmpanelled }) => {
                updateForm4((p) => ({
                  ...p,
                  hospitalName,
                  hospitalAddress: address || p.hospitalAddress,
                  isEmpanelledHospital: isEmpanelled
                }));
                updateForm5((p) => ({
                  ...p,
                  hospitalName,
                  hospitalType: isEmpanelled ? 'Panel' : 'Pvt.'
                }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Details of Referral</label>
              <textarea
                value={data.form4.referralDetails}
                onChange={(e) => updateForm4((p) => ({ ...p, referralDetails: e.target.value }))}
                rows={2}
                placeholder="Details of CMO/Specialist referral if any..."
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Details of Medical Advance</label>
              <textarea
                value={data.form4.medicalAdvanceDetails}
                onChange={(e) => updateForm4((p) => ({ ...p, medicalAdvanceDetails: e.target.value }))}
                rows={2}
                placeholder="Details of advance taken if any..."
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Table 12: Total Amount Claimed breakdown summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800">
                12. Total Amount Claimed (Synced from Form 1 Claim Details Table)
              </h4>
              <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                Total: ₹{grandTotalClaimed}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse text-slate-900 bg-white rounded-lg overflow-hidden border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700">
                    <th className="p-2 text-left">Treatment Type</th>
                    <th className="p-2 text-right">Consultation (₹)</th>
                    <th className="p-2 text-right">Investigation (₹)</th>
                    <th className="p-2 text-right">Medicine (₹)</th>
                    <th className="p-2 text-right">Other (₹)</th>
                    <th className="p-2 text-right">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-semibold text-slate-800">For OPD Treatment</td>
                    <td className="p-2 text-right font-medium">{data.form4.opdConsultation || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.opdInvestigation || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.opdMedicine || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.opdOther || '0'}</td>
                    <td className="p-2 text-right font-bold text-sky-700">₹{data.form4.opdTotal || grandTotalClaimed}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-slate-800">For Indoor Treatment</td>
                    <td className="p-2 text-right font-medium">{data.form4.indoorConsultation || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.indoorInvestigation || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.indoorMedicine || '0'}</td>
                    <td className="p-2 text-right font-medium">{data.form4.indoorOther || '0'}</td>
                    <td className="p-2 text-right font-bold text-slate-600">₹{data.form4.indoorTotal || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 These amounts are automatically calculated and synchronized from checked rows in <strong>Form 1 Claim Summary Table</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ============ FORM 5: CALCULATION SHEET EDITOR ========== */}
      {/* ======================================================== */}
      {activeFormTab === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 5: Calculation Sheet with Local CGHS Autocomplete</h3>
              <p className="text-xs text-slate-500">Search CGHS code/treatment to auto-fill approved rates from database</p>
            </div>
            <div className="flex items-center gap-2">
              {renderSaveButton('Save Calculation Sheet')}
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                Form 5 of 5
              </span>
            </div>
          </div>

          {/* Quick Patient Switcher */}
          {activePatients.length > 0 && (
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-sky-900">
                Patient for Calculation Sheet:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePatients.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateForm5((prev) => ({
                        ...prev,
                        patientName: p.name,
                        relationship: p.relation
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${data.form5.patientName === p.name
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {p.name} ({p.relation})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={data.form5.patientName}
                onChange={(e) => updateForm5((p) => ({ ...p, patientName: e.target.value.toUpperCase() }))}
                className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                value={data.form5.relationship}
                onChange={(e) => updateForm5((p) => ({ ...p, relationship: e.target.value }))}
                className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Type</label>
              <select
                value={data.form5.hospitalType}
                onChange={(e) => updateForm5((p) => ({ ...p, hospitalType: e.target.value as any }))}
                className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="Govt.">Govt.</option>
                <option value="Panel">Panel (Empanelled)</option>
                <option value="Pvt.">Pvt.</option>
                <option value="Diagonal Center">Diagonal Center</option>
              </select>
            </div>
          </div>

          {/* Dynamic Calculation Sheet Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700">Calculation Table Rows ({data.form5.calcRows.length})</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddCalcRow}
                  className="bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs px-3 py-1.5 rounded-lg border border-sky-200"
                >
                  + Add Row
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {data.form5.calcRows.map((row, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-900">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-800">Row #{row.sNo}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCalcRow(idx)}
                      className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {/* CGHS Code Picker with Date & Remarks */}
                  <CGHSCodePicker
                    dateValue={row.date}
                    codeValue={row.cghsCode}
                    nameValue={row.treatmentName}
                    remarksValue={row.remarks}
                    onDateChange={(val) => handleCalcRowChange(idx, 'date', val)}
                    onRemarksChange={(val) => handleCalcRowChange(idx, 'remarks', val)}
                    onSelect={({ code, name, approvedRate, date, remarks }) => {
                      updateForm5((prev) => {
                        const updated = [...prev.calcRows];
                        const curRow = { ...updated[idx] };
                        curRow.cghsCode = code;
                        curRow.treatmentName = name;
                        if (date !== undefined) curRow.date = date;
                        if (remarks !== undefined) curRow.remarks = remarks;

                        if (approvedRate) {
                          curRow.approvedRate = approvedRate;
                          if (!curRow.rateCharged || curRow.rateCharged === '0' || curRow.rateCharged.trim() === '') {
                            curRow.rateCharged = approvedRate;
                          }
                          const chargedNum = parseFloat(curRow.rateCharged);
                          const approvedNum = parseFloat(approvedRate);
                          if (!isNaN(chargedNum) && !isNaN(approvedNum)) {
                            curRow.restrictedClaim = Math.min(chargedNum, approvedNum).toString();
                          } else {
                            curRow.restrictedClaim = approvedRate;
                          }
                        }

                        updated[idx] = curRow;
                        return { ...prev, calcRows: updated };
                      });
                    }}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Rate Charged (₹)</label>
                      <input
                        type="text"
                        value={row.rateCharged}
                        onChange={(e) => handleCalcRowChange(idx, 'rateCharged', e.target.value)}
                        placeholder="Charged amount..."
                        className="w-full p-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Approved Rate (₹)</label>
                      <input
                        type="text"
                        value={row.approvedRate}
                        onChange={(e) => handleCalcRowChange(idx, 'approvedRate', e.target.value)}
                        placeholder="Approved rate..."
                        className="w-full p-1.5 text-xs text-slate-900 bg-slate-100 border border-slate-300 rounded font-bold text-sky-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Restricted Claim (₹)</label>
                      <input
                        type="text"
                        value={row.restrictedClaim}
                        onChange={(e) => handleCalcRowChange(idx, 'restrictedClaim', e.target.value)}
                        placeholder="Restricted..."
                        className="w-full p-1.5 text-xs text-slate-900 bg-emerald-50 border border-slate-300 rounded font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Remarks</label>
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleCalcRowChange(idx, 'remarks', e.target.value)}
                        placeholder="Remarks..."
                        className="w-full p-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Calculation Sheet Totals Summary */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm mt-3">
              <div className="font-bold flex items-center gap-1.5 text-sky-400">
                <span>📊</span>
                <span>Calculation Sheet Totals:</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400">Charged:</span>{' '}
                  <span className="text-white font-bold">₹{calcChargedTotal}</span>
                </div>
                <div>
                  <span className="text-slate-400">Approved:</span>{' '}
                  <span className="text-sky-300 font-bold">₹{calcApprovedTotal}</span>
                </div>
                <div>
                  <span className="text-emerald-300">Restricted Total:</span>{' '}
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    ₹{calcRestrictedTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Add Row Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200 mt-2">
              <button
                type="button"
                onClick={handleAddCalcRow}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>➕</span> Add Another Calculation Row
              </button>
              <div className="text-[11px] text-slate-500">
                Total calculation rows: <span className="font-bold text-slate-800">{data.form5.calcRows.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation & Universal Save Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800/40">
        <button
          type="button"
          onClick={onBack}
          className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs px-5 py-3 rounded-xl transition-all w-full sm:w-auto"
        >
          ← Back to Common Info
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {renderSaveButton('💾 Save Progress')}

          <button
            type="button"
            onClick={onPreview}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Preview 5-Page PDF →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
