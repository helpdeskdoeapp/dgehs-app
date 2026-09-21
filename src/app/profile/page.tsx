'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DatePicker from '@/components/DatePicker';
import { CommonProfile } from '@/types/form';

const DEFAULT_PROFILE: CommonProfile = {
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
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<CommonProfile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile(json.data);
        }
      })
      .catch((e) => console.error('Failed fetching profile', e));
  }, []);

  const handleChange = (field: keyof CommonProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveToNeon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const json = await res.json();
      if (json.success) {
        setToastMsg('Employee profile saved to Neon DB (PostgreSQL) successfully! Future claim forms will auto-fill with these details.');
        setTimeout(() => setToastMsg(''), 5000);
      }
    } catch (e) {
      console.error('Failed saving profile to Neon DB', e);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-2">
              <span>👤 Employee Profile Management</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Static Profile &amp; Default Claim Information</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Save your official DGEHS details here. Information saved in Neon DB will automatically prefill every new 5-form medical claim application!
            </p>
          </div>

          <button
            onClick={handleSaveToNeon}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? 'Saving...' : '💾 Save Profile to Neon DB'}
          </button>
        </div>

        {toastMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
            <span>✅ {toastMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-emerald-400">✕</button>
          </div>
        )}

        <form onSubmit={handleSaveToNeon} className="space-y-6 text-slate-900">

          {/* Card 1: DGEHS & Official Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>1. DGEHS Card &amp; Official Details</span>
              <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded">Neon DB Table: user_profiles</span>
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
                  onChange={(e) => handleChange('employeeName', e.target.value)}
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
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code No.</label>
                <input
                  type="text"
                  value={profile.employeeCode}
                  onChange={(e) => handleChange('employeeCode', e.target.value)}
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
                <div className="flex gap-4 pt-2 text-xs font-semibold text-slate-800">
                  {(['Pvt.', 'Semi Pvt.', 'General'] as const).map((ward) => (
                    <label key={ward} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="entitlement"
                        value={ward}
                        checked={profile.entitlement === ward}
                        onChange={() => handleChange('entitlement', ward)}
                        className="accent-sky-600"
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
                  onChange={(e) => handleChange('basicPay', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Level</label>
                <input
                  type="text"
                  value={profile.payLevel}
                  onChange={(e) => handleChange('payLevel', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone (Office)</label>
                <input
                  type="text"
                  value={profile.phoneOffice}
                  onChange={(e) => handleChange('phoneOffice', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone (Residence)</label>
                <input
                  type="text"
                  value={profile.phoneRes}
                  onChange={(e) => handleChange('phoneRes', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-Mail Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg font-mono"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Branch Tel. No.</label>
                <input
                  type="text"
                  value={profile.bankPhone}
                  onChange={(e) => handleChange('bankPhone', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              {saving ? 'Saving to Neon DB...' : '💾 Save Profile to Neon DB (PostgreSQL)'}
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}
