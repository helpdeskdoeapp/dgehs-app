'use client';

import React, { useState, useEffect } from 'react';
import { HospitalItem } from '@/types/form';

interface HospitalPickerProps {
  value: string;
  addressValue?: string;
  isEmpanelled?: boolean;
  onChange: (data: { hospitalName: string; address?: string; isEmpanelled: boolean }) => void;
}

export default function HospitalPicker({
  value,
  addressValue = '',
  isEmpanelled = true,
  onChange
}: HospitalPickerProps) {
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>(addressValue);

  useEffect(() => {
    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setHospitals(json.data || []);
          const match = (json.data || []).find((h: HospitalItem) => h.name === value);
          if (match) {
            setSelectedId(match.id);
          } else if (value) {
            setSelectedId('other');
            setManualName(value);
          }
        }
      })
      .catch((err) => console.error('Failed fetching hospitals', err));
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === 'other') {
      onChange({
        hospitalName: manualName,
        address: manualAddress,
        isEmpanelled: false
      });
    } else {
      const match = hospitals.find((h) => h.id === id);
      if (match) {
        onChange({
          hospitalName: match.name,
          address: match.address,
          isEmpanelled: true
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full text-slate-900">
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-1">
          Select Hospital (Empanelled Panel or Manual Entry)
        </label>
        <select
          value={selectedId}
          onChange={handleSelectChange}
          className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white text-slate-900 font-medium"
        >
          <option value="" disabled>-- Select Empanelled Panel Hospital --</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.isPanel ? `🏥 [Empanelled] ${h.name}` : `✍️ ${h.name}`}
            </option>
          ))}
        </select>
      </div>

      {selectedId === 'other' && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col gap-2 animate-fadeIn text-slate-900">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <span>ℹ️</span> Non-Empanelled / Custom Hospital Entry
          </div>
          <div>
            <label className="block text-[11px] text-slate-700 font-medium mb-0.5">Hospital Name</label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => {
                setManualName(e.target.value);
                onChange({
                  hospitalName: e.target.value,
                  address: manualAddress,
                  isEmpanelled: false
                });
              }}
              placeholder="Enter full hospital name..."
              className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-700 font-medium mb-0.5">Hospital Address</label>
            <textarea
              value={manualAddress}
              onChange={(e) => {
                setManualAddress(e.target.value);
                onChange({
                  hospitalName: manualName,
                  address: e.target.value,
                  isEmpanelled: false
                });
              }}
              placeholder="Enter full hospital address..."
              rows={2}
              className="w-full p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
