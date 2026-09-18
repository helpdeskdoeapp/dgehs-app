'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [viewYear, setViewYear] = useState(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${mm}-${dd}`;
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectedDateObj = value ? new Date(value + 'T00:00:00') : null;
  const isSelectedDay = (d: number) => {
    if (!selectedDateObj || isNaN(selectedDateObj.getTime())) return false;
    return (
      selectedDateObj.getFullYear() === viewYear &&
      selectedDateObj.getMonth() === viewMonth &&
      selectedDateObj.getDate() === d
    );
  };

  const todayObj = new Date();
  const isToday = (d: number) => {
    return (
      todayObj.getFullYear() === viewYear &&
      todayObj.getMonth() === viewMonth &&
      todayObj.getDate() === d
    );
  };

  // Generate Year options (current - 100 to current + 10)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 110 }, (_, i) => currentYear - 90 + i);

  return (
    <div ref={containerRef} className={`relative w-full text-slate-900 ${className}`}>
      {/* Input Box Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between p-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer transition-all hover:border-sky-500 shadow-sm ${
          isOpen ? 'ring-2 ring-sky-500 border-sky-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="text-sky-600 font-bold text-sm">📅</span>
      </div>

      {/* Tailwind Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 animate-fadeIn text-slate-900">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 transition-colors font-bold text-xs"
            >
              ‹
            </button>

            <div className="flex gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-slate-100 p-1 rounded-md border-none focus:outline-none"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-slate-100 p-1 rounded-md border-none focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 transition-colors font-bold text-xs"
            >
              ›
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
            {DAYS.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots for previous month offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1.5"></div>
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const selected = isSelectedDay(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`p-1.5 rounded-lg font-medium transition-all text-xs flex items-center justify-center ${
                    selected
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-500/30'
                      : today
                      ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 font-semibold"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sky-600 hover:text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-md"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
