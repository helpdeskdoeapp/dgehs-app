'use client';

import React from 'react';
import { CompleteFormData } from '@/types/form';

interface FormRendererProps {
  data: CompleteFormData;
  onEdit: () => void;
}

export default function FormRenderer({ data, onEdit }: FormRendererProps) {
  const { profile, form1, form2, form3, form4, form5 } = data;

  const handlePrint = () => {
    window.print();
  };

  const scrollToPage = (pageNum: number) => {
    const el = document.getElementById(`print-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const dash = (s?: string) => (s && s.trim().length > 0 ? s : '_______________________');

  const fmtDate = (s?: string) => {
    if (!s) return '.......................';
    const d = new Date(s + 'T00:00:00');
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Floating Action Bar (Hidden on Print) */}
      <div className="no-print sticky top-4 z-40 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl text-white flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            ← Back to Edit
          </button>
          <div className="text-xs text-slate-300">
            Previewing <span className="font-bold text-sky-400">5 Official Pages</span>
          </div>
        </div>

        {/* Page Jump Selector */}
        <div className="flex gap-1 text-[11px] font-semibold">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => scrollToPage(p)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-all"
            >
              P{p}
            </button>
          ))}
        </div>

        <button
          onClick={handlePrint}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2"
        >
          <span>🖨️ Download PDF / Print All 5 Forms</span>
        </button>
      </div>

      {/* Printable 5 Pages Container */}
      <div className="font-sans text-slate-900 max-w-4xl mx-auto space-y-8">

        {/* ==================== PAGE 1: Medical Application Form ==================== */}
        <div
          id="print-page-1"
          className="print-page bg-white border border-slate-300 rounded-xl shadow-md p-10 md:p-14 text-[13px] leading-relaxed relative"
        >
          <div className="text-right text-xs font-mono font-bold mb-1">DGEHS Card No: {dash(profile.cardNo)}</div>
          <h1 className="text-center text-xl font-bold underline mb-6 tracking-wide">Medical Application Form</h1>

          <div className="space-y-2.5">
            <div className="flex">
              <span className="w-1/2">1. Employee ID No: <strong>{dash(profile.employeeId)}</strong></span>
              <span className="w-1/2">Employee Code No: <strong>{dash(profile.employeeCode)}</strong></span>
            </div>

            <div className="flex">
              <span className="w-1/2">2. Name of official: <strong>{dash(profile.employeeName)}</strong></span>
              <span className="w-1/2">Designation: <strong>{dash(profile.designation)}</strong></span>
            </div>

            <div className="flex">
              <span className="w-1/2">3. Basic Pay Rs: <strong>{dash(profile.basicPay)}</strong></span>
              <span className="w-1/2">Pay Level: <strong>{dash(profile.payLevel)}</strong></span>
            </div>

            <div>
              4. Residence Address: <strong>{dash(profile.residenceAddress)}</strong> PH: <strong>{dash(profile.phoneMobile)}</strong>
            </div>

            <div className="flex pt-1">
              <span className="w-1/2">5. OPD period of treatment: From Date: <strong>{fmtDate(form1.opdFromDate)}</strong></span>
              <span className="w-1/2">to date: <strong>{fmtDate(form1.opdToDate)}</strong></span>
            </div>

            <div className="flex pb-2">
              <span className="w-1/2">6. Indoor period of treatment: From Date of admission: <strong>{fmtDate(form1.indoorAdmissionDate)}</strong></span>
              <span className="w-1/2">Date of discharge: <strong>{fmtDate(form1.indoorDischargeDate)}</strong></span>
            </div>
          </div>

          <div className="mt-3 font-bold text-xs">7. Details Number of Patients:</div>
          <table className="w-full border-collapse border border-slate-400 my-2 text-[12px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-1.5 w-8">S.No</th>
                <th className="border border-slate-400 p-1.5">Name of Patients</th>
                <th className="border border-slate-400 p-1.5">Relation</th>
                <th className="border border-slate-400 p-1.5">Name of treatment of Hospital</th>
                <th className="border border-slate-400 p-1.5">Consultation amount</th>
                <th className="border border-slate-400 p-1.5">Investigation amount</th>
                <th className="border border-slate-400 p-1.5">Other</th>
                <th className="border border-slate-400 p-1.5">Medicine amount</th>
                <th className="border border-slate-400 p-1.5">Claimed amount</th>
              </tr>
            </thead>
            <tbody>
              {form1.patients.map((p, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 p-1.5">{p.name || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.relation || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.hospitalName || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.consultationAmount || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.investigationAmount || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.otherAmount || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{p.medicineAmount || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5 font-bold">{p.claimedAmount || '\u00A0'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 font-bold text-xs">8. List of enclosure:</div>
          <div className="text-[12px] space-y-0.5 ml-3">
            <div>a- Annexure-I (Two copy)</div>
            <div>b- Annexure-II (Two copy)</div>
            <div>c- Calculation sheet (Two copy)</div>
            <div>d- Medical Card copy (Two copy)</div>
            <div>e- doctor's prescription slip with NA(Two copy)</div>
            <div>f- Bill Related receipt (Two copy)</div>
          </div>

          <div className="text-center font-bold underline mt-6 mb-2">Declaration to be signed by the official</div>
          <div className="text-justify text-[12px] leading-relaxed my-3">
            I hereby declare that all the statements in this application are to the best of my knowledge the person for whom medical expenses were incurred is completely dependent on me. I am a DGEHS beneficiary and the DGEHS card was valid at the time of treatment. I agree for the reimbursement as is admissible under the rule.
          </div>

          <div className="flex justify-between items-end mt-8 pt-4">
            <div>Dated: <strong>{fmtDate(form1.dated)}</strong></div>
            <div className="font-bold border-t border-slate-400 pt-1 px-4">Signature of the official</div>
          </div>

          <div className="page-number-tag">Page 1 of 5 (Form 1)</div>
        </div>


        {/* ==================== PAGE 2: Undertaking ==================== */}
        {(() => {
          const totalForm1Amount = form1.patients.reduce((sum, p) => {
            const val = parseFloat(p.claimedAmount);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
          const finalAmount = (form2.reimbursementAmount && form2.reimbursementAmount !== '0')
            ? form2.reimbursementAmount
            : (totalForm1Amount > 0 ? totalForm1Amount.toString() : '');
          const derivedMembers = form1.patients.map((p) => `${p.name} (${p.relation})`);
          const m1 = derivedMembers[0] || form2.familyMembers[0] || `${profile.employeeName} (Self)`;
          const m2 = derivedMembers[1] || form2.familyMembers[1] || '';
          const m3 = derivedMembers[2] || form2.familyMembers[2] || '';
          const m4 = derivedMembers[3] || form2.familyMembers[3] || '';

          return (
            <div
              id="print-page-2"
              className="print-page bg-white border border-slate-300 rounded-xl shadow-md p-10 md:p-14 text-[14px] leading-relaxed relative min-h-[700px] flex flex-col justify-between"
            >
              <div>
                <h1 className="text-center text-xl font-bold underline mb-10 tracking-wide">Undertaking</h1>

                <div className="text-justify leading-loose text-[14.5px] space-y-6">
                  <p>
                    I <strong>{dash(profile.employeeName)}</strong> Designation <strong>{dash(profile.designation)}</strong> DGEHS card No. <strong>{dash(profile.cardNo)}</strong> hereby give my undertaking in written that all the Medical Bills, submitted by me for re-imbursement of Rs. <strong>{dash(finalAmount)}</strong>, are correct and under the medical attendant rules. If any discrepancy is found at any time and any stage, I will refund the same amount. The re-imbursement bills for the above amount are being submitted in respect of the following family members:
                  </p>

                  <div className="grid grid-cols-2 gap-4 font-semibold pt-4 pl-4 text-[14px]">
                    <div>1. {dash(m1)}</div>
                    <div>2. {dash(m2)}</div>
                    <div>3. {dash(m3)}</div>
                    <div>4. {dash(m4)}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-20 pt-8">
                <div className="space-y-1 text-[13px]">
                  <div>Name of Employee: <strong>{dash(profile.employeeName)}</strong></div>
                  <div>Emp. ID: <strong>{dash(profile.employeeId)}</strong></div>
                </div>

                <div className="font-bold border-t border-slate-400 pt-1 px-6 text-center">
                  (Signature)
                </div>
              </div>

              <div className="page-number-tag">Page 2 of 5 (Form 2)</div>
            </div>
          );
        })()}


        {/* ==================== PAGE 3: Annexure-I ==================== */}
        <div
          id="print-page-3"
          className="print-page bg-white border border-slate-300 rounded-xl shadow-md p-10 md:p-14 text-[13px] leading-relaxed relative"
        >
          <div className="text-right font-bold text-xs mb-1">ANNEXURE-I</div>
          <div className="text-center font-bold underline">DELHI GOVERNMENT EMPLOYEES HEALTH SCHEME</div>
          <div className="text-center font-bold underline mb-5">MODIFIED CHECK LIST FOR REIMBURSEMENT OF MEDICAL CLAIMS</div>

          <div className="space-y-2 text-[12.5px]">
            <div>1. DGEHS Card No. and Place of Issue: <strong>{dash(profile.cardNo)}</strong> ({dash(profile.placeOfIssue)})</div>
            <div className="flex">
              <span className="w-1/2">2. Validity of DGEHS Card: from <strong>{fmtDate(profile.validFrom)}</strong></span>
              <span className="w-1/2">to <strong>{fmtDate(profile.validTo)}</strong></span>
            </div>
            <div>3. Ward Entitlement (if Admitted in Hospital): <strong>{profile.entitlement || 'Private. / Semi Private. / General'}</strong></div>
            <div>4. Full Name of Employee/Beneficiary (Block Letters): <strong>{dash(profile.employeeName)}</strong></div>
            <div>5. Designation: <strong>{dash(profile.designation)}</strong></div>

            <div className="pt-2 font-bold">6. The following documents are submitted: - (Please tick (✓) the relevant column)</div>
            <div className="space-y-1 pl-2 text-[12px]">
              {[
                { label: 'a) Revised Medical 2004 Form:-', val: form3.checklist.revisedMedical2004 },
                { label: 'b) Photocopy of DGEHS Card showing validity (Emp. /Patient):-', val: form3.checklist.photocopyCard },
                { label: 'c) Photocopy of Referral/ Authorization form AMA:-', val: form3.checklist.photocopyReferral },
                { label: 'd) Original Bills:-', val: form3.checklist.originalBills },
                { label: 'e) Copy of prescription for OPD cases / Discharge Summary for Indoor cases:-', val: form3.checklist.prescriptionOrDischarge },
                { label: 'f) Breakup for Lab Investigation:-', val: form3.checklist.breakupLab },
                { label: 'g) Breakup of Drugs prescribed:-', val: form3.checklist.breakupDrugs },
                { label: 'h) Emergency Certificate from Hospital Empanelled / Registered in case of Emergency Admission:-', val: form3.checklist.emergencyCert },
                { label: 'i) Self explanatory letter showing the need of emergency visit (in emergency cases):-', val: form3.checklist.emergencyLetter },
                { label: 'j) Non Availability Certificate from AMA for drugs prescribed in OPD\'s :-', val: form3.checklist.nonAvailabilityCert }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-dashed border-slate-200 py-0.5">
                  <span>{item.label}</span>
                  <span className="font-bold">{item.val || 'Yes/No'}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              7. Name of the Bank: <strong>{dash(profile.bankName)}</strong> Branch: <strong>{dash(profile.bankBranch)}</strong> SB A/C No: <strong>{dash(profile.sbAccountNo)}</strong>
            </div>
            <div>
              Branch MICR Code: <strong>{dash(profile.micrCode)}</strong> IFS Code: <strong>{dash(profile.ifsCode)}</strong> Tel. No. of Bank Branch: <strong>{dash(profile.bankPhone)}</strong>
            </div>
          </div>

          <div className="flex justify-between items-end mt-8 pt-4">
            <div>Dated: <strong>{fmtDate(form3.dated)}</strong></div>
            <div className="font-bold border-t border-slate-400 pt-1 px-4">Signature of DGEHS Card Holder</div>
          </div>

          <div className="mt-2 text-[12px]">
            Telephone No. (M) <strong>{dash(profile.phoneMobile)}</strong> (O) <strong>{dash(profile.phoneOffice)}</strong> E-Mail ID: <strong>{dash(profile.email)}</strong>
          </div>

          <div className="text-[10px] italic text-slate-500 mt-4 border-t pt-2">
            Note: 1. Kindly enclose Photocopy of Cancelled Cheque for online transfer of money to the account of beneficiary.<br/>
            2. Provide one original copy and two photocopies of complete set of claim.
          </div>

          <div className="page-number-tag">Page 3 of 5 (Form 3)</div>
        </div>


        {/* ==================== PAGE 4: Annexure-II Medical 2004 ==================== */}
        <div
          id="print-page-4"
          className="print-page bg-white border border-slate-300 rounded-xl shadow-md p-10 md:p-14 text-[13px] leading-relaxed relative"
        >
          <div className="text-right font-bold text-xs mb-1">ANNEXURE-II</div>
          <div className="text-center font-bold underline">DELHI GOVERNMENT EMPLOYEES HEALTH SCHEME</div>
          <div className="text-center font-bold underline text-[12.5px]">REVISED MEDICAL 2004 FORM FOR REIMBURSEMENT OF MEDICAL CLAIMS OF DGEHS BENEFICIARIES</div>
          <div className="text-center italic text-xs mb-4">(To be filled by the claimant)</div>

          <div className="space-y-2 text-[12.5px]">
            <div>1. DGEHS Card No. and Place of issue:- <strong>{dash(profile.cardNo)}</strong> ({dash(profile.placeOfIssue)})</div>
            <div className="flex">
              <span className="w-1/2">2. Validity of DGEHS Card: - from <strong>{fmtDate(profile.validFrom)}</strong></span>
              <span className="w-1/2">to <strong>{fmtDate(profile.validTo)}</strong></span>
            </div>
            <div>3. Ward Entitlement (if Admitted in Hospital): - <strong>{profile.entitlement || 'Private. / Semi Private. / General'}</strong></div>
            <div>4. Full Name of Employee/Beneficiary (Block Letters):- Mr./Ms. <strong>{dash(profile.employeeName)}</strong></div>
            <div>5. Full Address:-- <strong>{dash(profile.residenceAddress)}</strong></div>
            <div>6. Telephone No. (O) <strong>{dash(profile.phoneOffice)}</strong> (M) <strong>{dash(profile.phoneMobile)}</strong></div>
            <div>7. E-mail Address if, any: <strong>{dash(profile.email)}</strong></div>
            <div>8. Name of the Bank <strong>{dash(profile.bankName)}</strong> Branch <strong>{dash(profile.bankBranch)}</strong> SB A/C No. <strong>{dash(profile.sbAccountNo)}</strong></div>
            <div>Branch MICR Code <strong>{dash(profile.micrCode)}</strong> IFS Code <strong>{dash(profile.ifsCode)}</strong> Tel. No. of Bank Branch <strong>{dash(profile.bankPhone)}</strong></div>
            <div>9. Name of the Patient &amp; Relationship with the Card Holder:- <strong>{dash(form4.patientName)}</strong> ({dash(form4.relationship)})</div>
            <div>10. Basic Pay (Excluding Grade Pay):- <strong>{dash(profile.basicPay)}</strong></div>
            <div>11. Name of the Hospital with Address:- <strong>{dash(form4.hospitalName)}</strong> ({dash(form4.hospitalAddress)})</div>
            <div className="pl-4">
              (a) OPD Treatment (Investigations) &amp; Period of treatment:- <strong>{fmtDate(form1.opdFromDate)} to {fmtDate(form1.opdToDate)}</strong><br/>
              (b) Indoor Treatment:- Date of Admission <strong>{fmtDate(form1.indoorAdmissionDate)}</strong> Date of Discharge <strong>{fmtDate(form1.indoorDischargeDate)}</strong>
            </div>

            <div>12. Total Amount Claimed: - Total Rs.</div>
            <table className="w-full border-collapse border border-slate-400 my-1.5 text-[12px]">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-400 p-1.5 text-left">Total Amount Claimed</th>
                  <th className="border border-slate-400 p-1.5">Consultation Charges</th>
                  <th className="border border-slate-400 p-1.5">Investigation Charges</th>
                  <th className="border border-slate-400 p-1.5">Medicine Charges</th>
                  <th className="border border-slate-400 p-1.5">Other Charges</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 p-1.5 font-bold">For OPD Treatment</td>
                  <td className="border border-slate-400 p-1.5">{form4.opdConsultation || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.opdInvestigation || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.opdMedicine || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.opdOther || '___'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 font-bold">For Indoor Treatment</td>
                  <td className="border border-slate-400 p-1.5">{form4.indoorConsultation || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.indoorInvestigation || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.indoorMedicine || '___'}</td>
                  <td className="border border-slate-400 p-1.5">{form4.indoorOther || '___'}</td>
                </tr>
              </tbody>
            </table>

            <div>13. Details of Referral:- <strong>{dash(form4.referralDetails)}</strong></div>
            <div>14. Details of Medical Advance if, any:- <strong>{dash(form4.medicalAdvanceDetails)}</strong></div>
          </div>

          <div className="text-center font-bold underline mt-4 mb-1">DECLARATION</div>
          <div className="text-justify text-[11.5px] leading-tight">
            I hereby declare that statements made in the application are true to the best of my knowledge and belief and the person for whom medical expenses were incurred is wholly dependant on me. I am a DGEHS beneficiary and the DGEHS card was valid at the time of treatment. I agree for the reimbursement as is admissible under the rules.
          </div>

          <div className="flex justify-between items-end mt-6">
            <div>Dated:- <strong>{fmtDate(form4.declarationDate)}</strong></div>
            <div className="font-bold border-t border-slate-400 pt-1 px-4">Signature of DGEHS Card Holder</div>
          </div>

          <div className="page-number-tag">Page 4 of 5 (Form 4)</div>
        </div>


        {/* ==================== PAGE 5: Calculation Sheet ==================== */}
        <div
          id="print-page-5"
          className="print-page bg-white border border-slate-300 rounded-xl shadow-md p-10 md:p-14 text-[13px] leading-relaxed relative"
        >
          <h1 className="text-center text-lg font-bold underline mb-5 tracking-wide">CALCULATION SHEET FOR MEDICAL RE-IMBURSEMENT BILLS</h1>

          <div className="space-y-1.5 text-[12.5px] mb-3">
            <div className="flex">
              <span className="w-1/2">In R/o Sh. <strong>{dash(profile.employeeName)}</strong></span>
              <span className="w-1/2">Designation <strong>{dash(profile.designation)}</strong></span>
            </div>
            <div>
              Name of Patients <strong>{dash(form5.patientName)}</strong> relationship with card holder <strong>{dash(form5.relationship)}</strong>
            </div>
            <div>
              Name of treatment Hospital <strong>{dash(form5.hospitalName)}</strong>
            </div>
            <div>
              Whether Govt./Panel/Pvt. Hospital/Diagonal Center <strong>{dash(form5.hospitalType)}</strong>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-400 my-2 text-[11.5px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-400 p-1.5 w-8">S.No.</th>
                <th className="border border-slate-400 p-1.5 w-20">Date</th>
                <th className="border border-slate-400 p-1.5">Name of treatment/investigation</th>
                <th className="border border-slate-400 p-1.5 w-24">DGHS Code No.</th>
                <th className="border border-slate-400 p-1.5 w-24">Rate charged by Hospital</th>
                <th className="border border-slate-400 p-1.5 w-24">DGHS approved rate</th>
                <th className="border border-slate-400 p-1.5 w-24">Restricted claimant</th>
                <th className="border border-slate-400 p-1.5">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {form5.calcRows.map((r, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 p-1.5">{r.date || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{r.treatmentName || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5 font-mono font-bold">{r.cghsCode || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{r.rateCharged || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{r.approvedRate || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5 font-bold text-slate-900">{r.restrictedClaim || '\u00A0'}</td>
                  <td className="border border-slate-400 p-1.5">{r.remarks || '\u00A0'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-end mt-16 pt-6">
            <div className="text-center font-bold border-t border-slate-400 pt-1 px-4">
              Signature of Employee
            </div>
            <div className="text-center font-bold border-t border-slate-400 pt-1 px-4">
              Signature of DDO
            </div>
            <div className="text-center font-bold border-t border-slate-400 pt-1 px-4">
              Signature of HOS
            </div>
          </div>

          <div className="page-number-tag">Page 5 of 5 (Form 5)</div>
        </div>

      </div>
    </div>
  );
}
