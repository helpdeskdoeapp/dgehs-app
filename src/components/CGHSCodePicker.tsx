'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RateItem } from '@/types/form';
import DatePicker from './DatePicker';

interface CGHSCodePickerProps {
  dateValue?: string;
  codeValue: string;
  nameValue: string;
  remarksValue?: string;
  onSelect: (item: { code: string; name: string; approvedRate: string; date?: string; remarks?: string }) => void;
  onDateChange?: (date: string) => void;
  onRemarksChange?: (remarks: string) => void;
  placeholderCode?: string;
  placeholderName?: string;
  showDateAndRemarks?: boolean;
}

export default function CGHSCodePicker({
  dateValue = '',
  codeValue,
  nameValue,
  remarksValue = '',
  onSelect,
  onDateChange,
  onRemarksChange,
  placeholderCode = 'CGHS Code (e.g. LB001)',
  placeholderName = 'Search treatment or investigation...',
  showDateAndRemarks = true
}: CGHSCodePickerProps) {
  const [results, setResults] = useState<RateItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const activeInputRef = useRef<'code' | 'name'>('code');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/ratelist?q=${encodeURIComponent(searchTerm)}&limit=35`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data || []);
      }
    } catch (err) {
      console.error('Failed fetching rate list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field: 'code' | 'name', currentVal: string) => {
    activeInputRef.current = field;
    fetchResults(currentVal);
    setIsOpen(true);
  };

  const handleInputChange = (field: 'code' | 'name', val: string) => {
    activeInputRef.current = field;
    fetchResults(val);
    setIsOpen(true);
  };

  const handlePick = (item: RateItem) => {
    const approvedRate = item.tier_i_nabh_general_ward || '';
    const code = item.alphanumeric_code || '';
    const name = item.cghs_treatment_procedure_investigation_list || '';
    const defaultRemark = `CGHS Rate (₹${approvedRate})`;

    onSelect({
      code,
      name,
      approvedRate,
      date: dateValue,
      remarks: remarksValue || defaultRemark
    });

    if (onRemarksChange && !remarksValue) {
      onRemarksChange(defaultRemark);
    }

    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-2 text-slate-900 w-full">
      <div className="flex flex-col md:flex-row gap-2 w-full">

        {/* Optional Date Field */}
        {showDateAndRemarks && (
          <div className="w-full md:w-36">
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">Date</label>
            <DatePicker
              value={dateValue}
              onChange={(val) => {
                if (onDateChange) onDateChange(val);
                onSelect({ code: codeValue, name: nameValue, approvedRate: '', date: val, remarks: remarksValue });
              }}
              placeholder="Treatment Date"
            />
          </div>
        )}

        {/* Name Input */}
        <div className="flex-1 relative">
          {showDateAndRemarks && <label className="block text-[10px] font-semibold text-slate-600 mb-1">Treatment / Procedure / Investigation</label>}
          <input
            type="text"
            value={nameValue}
            onChange={(e) => {
              const val = e.target.value;
              onSelect({ code: codeValue, name: val, approvedRate: '', date: dateValue, remarks: remarksValue });
              handleInputChange('name', val);
            }}
            onFocus={() => handleFocus('name', nameValue)}
            placeholder={placeholderName}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Code Input */}
        <div className="w-full md:w-36 relative">
          {showDateAndRemarks && <label className="block text-[10px] font-semibold text-slate-600 mb-1">CGHS Code</label>}
          <input
            type="text"
            value={codeValue}
            onChange={(e) => {
              const val = e.target.value;
              onSelect({ code: val, name: nameValue, approvedRate: '', date: dateValue, remarks: remarksValue });
              handleInputChange('code', val);
            }}
            onFocus={() => handleFocus('code', codeValue)}
            placeholder={placeholderCode}
            className="w-full p-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white text-sky-700 uppercase"
          />
        </div>
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 p-1 text-slate-900">
          {loading ? (
            <div className="p-3 text-xs text-slate-500 text-center animate-pulse">Searching CGHS rate list database...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 text-center">No CGHS codes found</div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.alphanumeric_code}-${item.s_no}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before selection
                  handlePick(item);
                }}
                className="p-2.5 hover:bg-sky-50 cursor-pointer rounded-lg transition-colors flex flex-col gap-1 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[11px]">
                    {item.alphanumeric_code}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    NABH Approved Rate: ₹{item.tier_i_nabh_general_ward}
                  </span>
                </div>
                <div className="font-medium text-slate-900 line-clamp-2">{item.cghs_treatment_procedure_investigation_list}</div>
                <div className="text-[10px] text-slate-500">{item.speciality_classification}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
