'use client';

import React, { useState } from 'react';
import { CommonProfile } from '@/types/form';
import DatePicker from './DatePicker';

interface CommonProfileFormProps {
  profile: CommonProfile;
  onChange: (profile: CommonProfile) => void;
  onNext: () => void;
}

export default function CommonProfileForm({ profile, onChange, onNext }: CommonProfileFormProps) {
  const [loadingApi, setLoadingApi] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleChange = (field: keyof CommonProfile, value: string) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const handleFetchFromApi = async () => {
    setLoadingApi(true);
    try {
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.success && json.data) {
        onChange(json.data);
        setToastMsg('Loaded employee profile from API database!');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Action Header */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-2">
            <span>Step 1 of 2</span> — Common Information Collection
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Employee &amp; Card Holder Details</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Information entered here will automatically propagate across all 5 official DGEHS medical claim forms.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFetchFromApi}
          disabled={loadingApi}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-all flex items-center gap-2"
        >
          {loadingApi ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>✨ Load Sample Profile from API</span>
          )}
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Personal & Official Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
        <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          1. Official &amp; Card Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">DGEHS Card No.</label>
            <input
              type="text"
              value={profile.cardNo}
              onChange={(e) => handleChange('cardNo', e.target.value)}
              placeholder="e.g. DGEHS-DEL-887412"
              className="w-full p-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Place of Issue</label>
            <input
              type="text"
              value={profile.placeOfIssue}
              onChange={(e) => handleChange('placeOfIssue', e.target.value)}
              placeholder="Dispensary name..."
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Card Holder Full Name (Block Letters)</label>
            <input
              type="text"
              value={profile.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              placeholder="Full name..."
              className="w-full p-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID No.</label>
            <input
              type="text"
              value={profile.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee Code No.</label>
            <input
              type="text"
              value={profile.employeeCode}
              onChange={(e) => handleChange('employeeCode', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={profile.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={profile.status}
              onChange={(e) => handleChange('status', e.target.value as any)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            >
              <option value="Govt. Servant">Govt. Servant</option>
              <option value="Pensioner">Pensioner</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Card Validity — From</label>
            <DatePicker
              value={profile.validFrom}
              onChange={(val) => handleChange('validFrom', val)}
              placeholder="Select validity start..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Card Validity — To</label>
            <DatePicker
              value={profile.validTo}
              onChange={(val) => handleChange('validTo', val)}
              placeholder="Select validity end..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Ward Entitlement</label>
            <div className="flex gap-4 pt-2 text-xs font-medium text-slate-800">
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Basic Pay (Excluding Grade Pay)</label>
            <input
              type="text"
              value={profile.basicPay}
              onChange={(e) => handleChange('basicPay', e.target.value)}
              placeholder="e.g. 78800"
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Pay Level</label>
            <input
              type="text"
              value={profile.payLevel}
              onChange={(e) => handleChange('payLevel', e.target.value)}
              placeholder="e.g. Level 10"
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Residence Address</label>
          <textarea
            value={profile.residenceAddress}
            onChange={(e) => handleChange('residenceAddress', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      {/* Contact & Bank Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-900">
        <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          2. Contact &amp; Bank Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mobile No.</label>
            <input
              type="text"
              value={profile.phoneMobile}
              onChange={(e) => handleChange('phoneMobile', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Telephone (Office)</label>
            <input
              type="text"
              value={profile.phoneOffice}
              onChange={(e) => handleChange('phoneOffice', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Telephone (Residence)</label>
            <input
              type="text"
              value={profile.phoneRes}
              onChange={(e) => handleChange('phoneRes', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">E-Mail Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name of the Bank</label>
            <input
              type="text"
              value={profile.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
            <input
              type="text"
              value={profile.bankBranch}
              onChange={(e) => handleChange('bankBranch', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">SB A/C No.</label>
            <input
              type="text"
              value={profile.sbAccountNo}
              onChange={(e) => handleChange('sbAccountNo', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Branch MICR Code</label>
            <input
              type="text"
              value={profile.micrCode}
              onChange={(e) => handleChange('micrCode', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">IFS Code</label>
            <input
              type="text"
              value={profile.ifsCode}
              onChange={(e) => handleChange('ifsCode', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Bank Branch Tel. No.</label>
            <input
              type="text"
              value={profile.bankPhone}
              onChange={(e) => handleChange('bankPhone', e.target.value)}
              className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>Continue to Form Specifics →</span>
        </button>
      </div>
    </div>
  );
}
