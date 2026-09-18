'use client';

import React, { useState } from 'react';
import { CompleteFormData, CalcRow } from '@/types/form';
import CGHSCodePicker from './CGHSCodePicker';
import HospitalPicker from './HospitalPicker';
import DatePicker from './DatePicker';

interface FormSpecificsEditorProps {
  data: CompleteFormData;
  onChange: (data: CompleteFormData) => void;
  onBack: () => void;
  onPreview: () => void;
}

export default function FormSpecificsEditor({ data, onChange, onBack, onPreview }: FormSpecificsEditorProps) {
  const [activeFormTab, setActiveFormTab] = useState<1 | 3 | 4 | 5>(1);

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

  return (
    <div className="space-y-6 text-slate-900">
      {/* Tab Navigation (Form 2 Undertaking is auto-calculated and skipped) */}
      <div className="bg-slate-900 p-2 rounded-2xl flex flex-wrap gap-1.5 text-xs font-semibold shadow-lg text-white">
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
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeFormTab === tab.num
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

      <div className="bg-sky-50/80 border border-sky-200 text-sky-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
        <span>⚡ <strong>Smart Auto-Fill:</strong> Form 2 (Undertaking) is automatically generated from your profile and claim summary table!</span>
      </div>

      {/* ============ FORM 1 EDITOR ============ */}
      {activeFormTab === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 1: Medical Application Form Specifics</h3>
              <p className="text-xs text-slate-500">OPD/Indoor treatment periods &amp; patient claim details</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">Form 1 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">5. OPD Treatment Period</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">From Date</label>
                  <DatePicker
                    value={data.form1.opdFromDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, opdFromDate: val }))}
                    placeholder="From Date..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">To Date</label>
                  <DatePicker
                    value={data.form1.opdToDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, opdToDate: val }))}
                    placeholder="To Date..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">6. Indoor Treatment Period</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Date of Admission</label>
                  <DatePicker
                    value={data.form1.indoorAdmissionDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, indoorAdmissionDate: val }))}
                    placeholder="Admission..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Date of Discharge</label>
                  <DatePicker
                    value={data.form1.indoorDischargeDate}
                    onChange={(val) => updateForm1((p) => ({ ...p, indoorDischargeDate: val }))}
                    placeholder="Discharge..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">7. Patient Claim Summary Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-200 text-slate-900">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="border p-2 w-8">S.N</th>
                    <th className="border p-2">Patient Name</th>
                    <th className="border p-2">Relation</th>
                    <th className="border p-2">Hospital Name</th>
                    <th className="border p-2 w-24">Consultation</th>
                    <th className="border p-2 w-24">Investigation</th>
                    <th className="border p-2 w-24">Medicine</th>
                    <th className="border p-2 w-24">Other</th>
                    <th className="border p-2 w-24">Claimed Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.form1.patients.map((pat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], name: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.relation}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], relation: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.hospitalName}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], hospitalName: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.consultationAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], consultationAmount: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.investigationAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], investigationAmount: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.medicineAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], medicineAmount: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.otherAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], otherAmount: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={pat.claimedAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateForm1((p) => {
                              const pts = [...p.patients];
                              pts[idx] = { ...pts[idx], claimedAmount: val };
                              return { ...p, patients: pts };
                            });
                          }}
                          className="w-full p-1 text-xs text-slate-900 bg-white border rounded font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============ FORM 3 EDITOR ============ */}
      {activeFormTab === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 3: Annexure-I Document Checklist</h3>
              <p className="text-xs text-slate-500">Tick submitted documents (Yes/No)</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">Form 3 of 5</span>
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

      {/* ============ FORM 4 EDITOR ============ */}
      {activeFormTab === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 4: Annexure-II Medical 2004 Specifics</h3>
              <p className="text-xs text-slate-500">Hospital selection, breakdown of claimed amounts, &amp; referral details</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">Form 4 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={data.form4.patientName}
                onChange={(e) => updateForm4((p) => ({ ...p, patientName: e.target.value }))}
                placeholder="Patient full name..."
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship with Card Holder</label>
              <input
                type="text"
                value={data.form4.relationship}
                onChange={(e) => updateForm4((p) => ({ ...p, relationship: e.target.value }))}
                placeholder="e.g. Self, Wife, Son, Mother..."
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
        </div>
      )}

      {/* ============ FORM 5 EDITOR ============ */}
      {activeFormTab === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn text-slate-900">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-sky-900">Form 5: Calculation Sheet with Local NoSQL CGHS Autocomplete</h3>
              <p className="text-xs text-slate-500">Search CGHS code/treatment to auto-fill approved rates from NoSQL DB</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">Form 5 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={data.form5.patientName}
                onChange={(e) => updateForm5((p) => ({ ...p, patientName: e.target.value }))}
                className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
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
                        if (date) curRow.date = date;
                        if (remarks) curRow.remarks = remarks;

                        if (approvedRate) {
                          curRow.approvedRate = approvedRate;
                          if (!curRow.rateCharged || curRow.rateCharged === '0') {
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
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs px-5 py-3 rounded-xl transition-all"
        >
          ← Back to Common Info
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <span>Preview &amp; Download 5-Page Printable PDF →</span>
        </button>
      </div>
    </div>
  );
}
