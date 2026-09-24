'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DatePicker from '@/components/DatePicker';
import AuthModal from '@/components/AuthModal';
import { CommonProfile, DependentProfile } from '@/types/form';
import { showSuccessAlert, showErrorAlert, showConfirmDeleteWithLoader } from '@/lib/alerts';

const DEFAULT_PROFILE: CommonProfile = {
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
};

const PAY_LEVELS = Array.from({ length: 18 }, (_, i) => `Level ${i + 1}`);

export default function ProfilePage() {
  const [profile, setProfile] = useState<CommonProfile>(DEFAULT_PROFILE);
  const [dependents, setDependents] = useState<DependentProfile[]>([
    { name: DEFAULT_PROFILE.employeeName, relation: 'Self', dob: '', gender: '' }
  ]);
  const [dependentErrors, setDependentErrors] = useState<{
    [rowIdx: number]: { name?: boolean; relation?: boolean; dob?: boolean; gender?: boolean };
  }>({});
  const [saving, setSaving] = useState(false);
  const [savingDependents, setSavingDependents] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string; id?: string; image?: string | null } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  const loadProfile = () => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setIsLoggedIn(!!json.isLoggedIn);
          if (json.user) {
            setCurrentUser(json.user);
          }
          if (json.data) {
            setProfile(json.data);
            // Sync Self row name if needed
            setDependents((prev) => {
              if (prev.length > 0 && prev[0].relation === 'Self') {
                const updated = [...prev];
                updated[0] = { ...updated[0], name: json.data.employeeName || updated[0].name };
                return updated;
              }
              return prev;
            });
          }
        }
      })
      .catch((e) => console.error('Failed fetching profile', e));

    loadDependents();
  };

  const loadDependents = () => {
    fetch('/api/profile/dependents')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setDependents(json.data);
        }
      })
      .catch((e) => console.error('Failed fetching dependents', e));
  };

  useEffect(() => {
    loadProfile();

    window.addEventListener('focus', loadProfile);
    window.addEventListener('dgehs-session-changed', loadProfile);
    return () => {
      window.removeEventListener('focus', loadProfile);
      window.removeEventListener('dgehs-session-changed', loadProfile);
    };
  }, []);

  const handleChange = (field: keyof CommonProfile, value: string) => {
    setProfile((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'employeeName') {
        setDependents((dPrev) => {
          if (dPrev.length > 0 && dPrev[0].relation === 'Self') {
            const copy = [...dPrev];
            copy[0] = { ...copy[0], name: value };
            return copy;
          }
          return dPrev;
        });
        if (value.trim()) {
          setDependentErrors((prevErr) => {
            if (!prevErr[0]?.name) return prevErr;
            const copy = { ...prevErr };
            const row0 = { ...copy[0] };
            delete row0.name;
            if (Object.keys(row0).length === 0) delete copy[0];
            else copy[0] = row0;
            return copy;
          });
        }
      }
      return next;
    });
  };

  const handleAddDependent = () => {
    setDependents((prev) => {
      const next = [
        ...prev,
        { name: '', relation: 'Wife', dob: '', gender: '' }
      ];
      const newIdx = next.length - 1;
      setTimeout(() => {
        handleFocusEdit(newIdx);
      }, 50);
      return next;
    });
  };

  const handleDependentChange = (index: number, field: keyof DependentProfile, value: string) => {
    setDependents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error highlight when field is filled
    if (value && value.trim()) {
      setDependentErrors((prev) => {
        const rowErr = prev[index];
        if (!rowErr || !(field in rowErr)) return prev;
        const newRowErr = { ...rowErr };
        delete (newRowErr as Record<string, boolean | undefined>)[field];
        const copy = { ...prev };
        if (Object.keys(newRowErr).length === 0) {
          delete copy[index];
        } else {
          copy[index] = newRowErr;
        }
        return copy;
      });
    }
  };

  const handleFocusEdit = (index: number) => {
    setActiveEditIndex(index);
    setTimeout(() => {
      const el = document.getElementById(`dep-name-${index}`);
      if (el) {
        el.focus();
        (el as HTMLInputElement).select();
      }
    }, 50);
  };

  const validateDependents = (): boolean => {
    const errors: { [rowIdx: number]: { name?: boolean; relation?: boolean; dob?: boolean; gender?: boolean } } = {};
    let hasError = false;

    dependents.forEach((dep, idx) => {
      const rowErrors: { name?: boolean; relation?: boolean; dob?: boolean; gender?: boolean } = {};

      if (!dep.name || !dep.name.trim()) {
        rowErrors.name = true;
        hasError = true;
      }
      if (!dep.relation || !dep.relation.trim()) {
        rowErrors.relation = true;
        hasError = true;
      }
      if (!dep.dob || !dep.dob.trim()) {
        rowErrors.dob = true;
        hasError = true;
      }
      if (!dep.gender || !dep.gender.trim()) {
        rowErrors.gender = true;
        hasError = true;
      }

      if (Object.keys(rowErrors).length > 0) {
        errors[idx] = rowErrors;
      }
    });

    setDependentErrors(errors);
    return !hasError;
  };

  const handleDeleteDependent = async (index: number) => {
    if (dependents[index]?.relation === 'Self' && index === 0) return;
    const dep = dependents[index];
    const depName = dep?.name ? `"${dep.name}"` : 'this dependent';

    await showConfirmDeleteWithLoader(
      'Delete Dependent?',
      `Are you sure you want to remove ${depName} from your medical beneficiaries?`,
      async () => {
        const updated = dependents.filter((_, idx) => idx !== index);
        const res = await fetch('/api/profile/dependents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dependents: updated })
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to delete dependent from database.');
        }
        setDependents(updated);
        setDependentErrors((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      },
      'Deleted Successfully',
      `${depName} has been removed from your beneficiaries.`
    );
  };

  const handleSaveDependents = async () => {
    if (!validateDependents()) {
      showErrorAlert(
        'Incomplete Dependent Details',
        'Please fill in all required fields (Name, Relation, Date of Birth, and Gender) for all dependents highlighted in red before saving.'
      );
      return;
    }

    setSavingDependents(true);
    try {
      const res = await fetch('/api/profile/dependents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependents })
      });
      const json = await res.json();
      if (json.success) {
        showSuccessAlert('Dependents Saved!', 'Dependent details saved to database (dependent_profiles table) successfully.');
        if (json.data) {
          setDependents(json.data);
        }
      } else {
        showErrorAlert('Failed to Save', json.error || 'Failed to save dependent details.');
      }
    } catch (e) {
      console.error('Failed saving dependents', e);
      showErrorAlert('Network Error', 'A network error occurred while saving dependent details.');
    } finally {
      setSavingDependents(false);
    }
  };

  const handleSaveToNeon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDependents()) {
      showErrorAlert(
        'Incomplete Dependent Details',
        'Please complete all required fields for your dependents highlighted in red before saving.'
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const json = await res.json();
      if (json.success) {
        // Also save dependents concurrently
        await fetch('/api/profile/dependents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dependents })
        });
        showSuccessAlert('Saved Successfully!', 'Employee profile and dependent details saved to database successfully.');
      } else {
        showErrorAlert('Failed to Save', json.error || 'Failed to save employee profile.');
      }
    } catch (e) {
      console.error('Failed saving profile', e);
      showErrorAlert('Network Error', 'A network error occurred while saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

        {/* Page Header Banner */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xl font-semibold">
                Employee Profile Management
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Save your official DGEHS details here. Information saved will automatically prefill every new 5-form medical claim application.
            </p>
          </div>

          <button
            onClick={handleSaveToNeon}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21V13H7v8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
            </svg>
            <span>{saving ? 'Saving profile...' : 'Save Profile'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveToNeon} className="space-y-6 text-slate-900">

          {/* Card 1: DGEHS & Official Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>1. DGEHS Card &amp; Official Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DGEHS Card No.</label>
                <input
                  type="text"
                  value={profile.cardNo}
                  onChange={(e) => handleChange('cardNo', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Place of Issue</label>
                <input
                  type="text"
                  value={profile.placeOfIssue}
                  onChange={(e) => handleChange('placeOfIssue', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Holder Full Name</label>
                <input
                  type="text"
                  value={profile.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  placeholder="Only alphabets"
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg uppercase font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID No.</label>
                <input
                  type="text"
                  value={profile.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value.replace(/\D/g, ''))}
                  placeholder="Digits only"
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code No.</label>
                <input
                  type="text"
                  value={profile.employeeCode}
                  onChange={(e) => handleChange('employeeCode', e.target.value.replace(/\D/g, ''))}
                  placeholder="Digits only"
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Status</label>
                <select
                  value={profile.status}
                  onChange={(e) => handleChange('status', e.target.value as any)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Govt. Servant">Govt. Servant</option>
                  <option value="Pensioner">Pensioner</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Validity — From</label>
                <DatePicker
                  value={profile.validFrom}
                  onChange={(val) => handleChange('validFrom', val)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Validity — To</label>
                <DatePicker
                  value={profile.validTo}
                  onChange={(val) => handleChange('validTo', val)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ward Entitlement</label>
                <div className="flex flex-wrap gap-3.5 pt-2 text-xs font-semibold text-slate-800">
                  {(['Pvt.', 'Semi Pvt.', 'General', 'N/A'] as const).map((ward) => (
                    <label key={ward} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="entitlement"
                        value={ward}
                        checked={profile.entitlement === ward}
                        onChange={() => handleChange('entitlement', ward)}
                        className="accent-sky-600 cursor-pointer"
                      />
                      {ward}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Pay (Rs.)</label>
                <input
                  type="text"
                  value={profile.basicPay}
                  onChange={(e) => handleChange('basicPay', e.target.value.replace(/\D/g, ''))}
                  placeholder="Digits only"
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Level</label>
                <select
                  value={profile.payLevel}
                  onChange={(e) => handleChange('payLevel', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="">Select Pay Level</option>
                  {PAY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Address Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Residence Address &amp; Contact Numbers
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residence Address</label>
              <textarea
                value={profile.residenceAddress}
                onChange={(e) => handleChange('residenceAddress', e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile No.</label>
                <input
                  type="text"
                  value={profile.phoneMobile}
                  onChange={(e) => handleChange('phoneMobile', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone (Office) <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.phoneOffice}
                  onChange={(e) => handleChange('phoneOffice', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone (Residence) <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.phoneRes}
                  onChange={(e) => handleChange('phoneRes', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Bank Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Electronic Reimbursement Bank Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name of the Bank</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={profile.bankBranch}
                  onChange={(e) => handleChange('bankBranch', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Savings Account No.</label>
                <input
                  type="text"
                  value={profile.sbAccountNo}
                  onChange={(e) => handleChange('sbAccountNo', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MICR Code</label>
                <input
                  type="text"
                  value={profile.micrCode}
                  onChange={(e) => handleChange('micrCode', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFS Code</label>
                <input
                  type="text"
                  value={profile.ifsCode}
                  onChange={(e) => handleChange('ifsCode', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono uppercase font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Branch Tel. No. <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.bankPhone}
                  onChange={(e) => handleChange('bankPhone', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Dependents Details (Medical Beneficiaries) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  4. Dependents Details (Medical Beneficiaries)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add family members covered under your DGEHS card entitlement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddDependent}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕</span> Add Dependent
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveDependents()}
                  disabled={savingDependents}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21V13H7v8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                  </svg>
                  <span>{savingDependents ? 'Saving...' : 'Save Details'}</span>
                </button>
              </div>
            </div>

            {/* Dependents Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Name</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Relation</th>
                    <th className="py-3.5 px-4 min-w-[190px]">Date of Birth</th>
                    <th className="py-3.5 px-4 min-w-[140px]">Gender</th>
                    <th className="py-3.5 px-4 min-w-[170px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dependents.map((dep, idx) => {
                    const isSelf = dep.relation === 'Self' && idx === 0;
                    const isEditing = activeEditIndex === idx;
                    return (
                      <tr
                        key={dep.id || idx}
                        className={`transition-colors ${isEditing ? 'bg-sky-50/40 ring-1 ring-inset ring-sky-300' : 'hover:bg-slate-50/70'
                          }`}
                      >
                        <td className="py-4 px-4 text-center font-bold text-slate-500 align-middle">{idx + 1}</td>
                        <td className="py-4 px-4 align-middle">
                          <input
                            id={`dep-name-${idx}`}
                            type="text"
                            value={dep.name}
                            onChange={(e) => handleDependentChange(idx, 'name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            onFocus={() => setActiveEditIndex(idx)}
                            placeholder="Full name..."
                            className={`w-full p-2.5 text-xs text-slate-900 bg-white border rounded-lg font-bold uppercase focus:outline-none shadow-sm transition-all ${dependentErrors[idx]?.name
                              ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30'
                              : isEditing
                                ? 'border-sky-400 ring-1 ring-sky-300 focus:ring-2 focus:ring-sky-500'
                                : 'border-slate-300 focus:ring-2 focus:ring-sky-500'
                              }`}
                          />
                        </td>
                        <td className="py-4 px-4 align-middle">
                          {isSelf ? (
                            <div className="p-2.5 text-xs font-bold text-sky-800 bg-sky-50 rounded-lg border border-sky-200 text-center shadow-sm">
                              Self (Card Holder)
                            </div>
                          ) : (
                            <select
                              value={dep.relation}
                              onChange={(e) => handleDependentChange(idx, 'relation', e.target.value)}
                              onFocus={() => setActiveEditIndex(idx)}
                              className={`w-full p-2.5 text-xs text-slate-900 bg-white border rounded-lg font-medium focus:outline-none shadow-sm transition-all ${dependentErrors[idx]?.relation
                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30'
                                : 'border-slate-300 focus:ring-2 focus:ring-sky-500'
                                }`}
                            >
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
                          )}
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <DatePicker
                            value={dep.dob}
                            onChange={(val) => handleDependentChange(idx, 'dob', val)}
                            placeholder="Select DOB..."
                            hasError={!!dependentErrors[idx]?.dob}
                          />
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <select
                            value={dep.gender}
                            onChange={(e) => handleDependentChange(idx, 'gender', e.target.value)}
                            onFocus={() => setActiveEditIndex(idx)}
                            className={`w-full p-2.5 text-xs text-slate-900 bg-white border rounded-lg font-medium focus:outline-none shadow-sm transition-all ${dependentErrors[idx]?.gender
                              ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30'
                              : 'border-slate-300 focus:ring-2 focus:ring-sky-500'
                              }`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-center align-middle">
                          {isSelf ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200 shadow-sm">
                              👤 Primary Account
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleFocusEdit(idx)}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
                                title="Edit Dependent Details"
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDependent(idx)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
                                title="Delete Dependent"
                              >
                                <span>🗑️</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">

              <button
                type="button"
                onClick={() => handleSaveDependents()}
                disabled={savingDependents}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 21V13H7v8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
                </svg>
                <span>{savingDependents ? 'Saving Details...' : 'Save Dependents Details'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21V13H7v8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v5h8" />
              </svg>
              <span>{saving ? 'Saving profile...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => {
          loadProfile();
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}
