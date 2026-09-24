'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or DD/MM/YYYY
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Convert YYYY-MM-DD to DD/MM/YYYY
export function isoToDisplay(iso: string): string {
  if (!iso || !iso.trim()) return '';
  const trimmed = iso.trim();

  // If already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;

  // If YYYY-MM-DD
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  const d = new Date(trimmed + 'T00:00:00');
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return trimmed;
}

// Convert DD/MM/YYYY, DD-MM-YYYY, or typed string to YYYY-MM-DD
export function displayToIso(display: string): string | null {
  if (!display || !display.trim()) return '';
  const trimmed = display.trim();

  // Match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const match = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (match) {
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
        const dd = String(d).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
    }
    return null;
  }

  // Match 8 digits: DDMMYYYY
  if (/^\d{8}$/.test(trimmed)) {
    const d = parseInt(trimmed.slice(0, 2), 10);
    const m = parseInt(trimmed.slice(2, 4), 10);
    const y = parseInt(trimmed.slice(4, 8), 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
        const dd = String(d).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
    }
    return null;
  }

  // Match standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map((n) => parseInt(n, 10));
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
      return trimmed;
    }
  }

  return null;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  disabled = false,
  hasError = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [textInput, setTextInput] = useState(() => isoToDisplay(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal text state with external value changes
  useEffect(() => {
    setTextInput(isoToDisplay(value));
    const iso = displayToIso(value) || value;
    if (iso) {
      const d = new Date(iso + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const getInitialDate = () => {
    const iso = displayToIso(value) || value;
    if (iso) {
      const d = new Date(iso + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const initialDate = getInitialDate();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = 330;
    const popoverWidth = 288;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    let top = openUpwards
      ? rect.top + window.scrollY - popoverHeight - 6
      : rect.bottom + window.scrollY + 6;

    let left = rect.left + window.scrollX;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }

    setPopoverCoords({ top, left });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Auto-mask digits with slashes if entering pure digits
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length > 0 && !raw.includes('-') && !raw.includes('.')) {
      if (raw.length > textInput.length) {
        // User is typing forwards
        if (digitsOnly.length <= 2) {
          raw = digitsOnly;
        } else if (digitsOnly.length <= 4) {
          raw = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
        } else {
          raw = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
        }
      }
    }

    setTextInput(raw);

    if (!raw.trim()) {
      onChange('');
      return;
    }

    const iso = displayToIso(raw);
    if (iso) {
      onChange(iso);
      const d = new Date(iso + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  };

  const handleBlur = () => {
    if (!textInput.trim()) {
      setTextInput('');
      onChange('');
      return;
    }

    const iso = displayToIso(textInput);
    if (iso) {
      onChange(iso);
      setTextInput(isoToDisplay(iso));
    } else {
      // If invalid, revert back to last valid value or clear
      if (value) {
        setTextInput(isoToDisplay(value));
      } else {
        setTextInput('');
        onChange('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      setIsOpen(false);
    }
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
    const isoDate = `${viewYear}-${mm}-${dd}`;
    setTextInput(`${dd}/${mm}/${viewYear}`);
    onChange(isoDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const isoDate = `${today.getFullYear()}-${mm}-${dd}`;
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setTextInput(`${dd}/${mm}/${today.getFullYear()}`);
    onChange(isoDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTextInput('');
    onChange('');
    setIsOpen(false);
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isSelectedDay = (d: number) => {
    const iso = displayToIso(value) || value;
    if (!iso) return false;
    const dObj = new Date(iso + 'T00:00:00');
    if (isNaN(dObj.getTime())) return false;
    return (
      dObj.getFullYear() === viewYear &&
      dObj.getMonth() === viewMonth &&
      dObj.getDate() === d
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

  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const endYear = Math.max(currentYear + 100, viewYear + 50, 2100);
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const popoverContent = (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: `${popoverCoords.top}px`,
        left: `${popoverCoords.left}px`,
        width: '288px',
        zIndex: 99999
      }}
      className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-fadeIn text-slate-900"
    >
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
  );

  return (
    <div ref={containerRef} className={`relative w-full text-slate-900 ${className}`}>
      {/* Hybrid Input: Direct manual typing + calendar popup button */}
      <div
        className={`flex items-center text-xs font-semibold text-slate-900 bg-white border rounded-lg transition-all shadow-sm focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 ${
          hasError
            ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30'
            : isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <input
          type="text"
          value={textInput}
          disabled={disabled}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'DD/MM/YYYY'}
          className="w-full p-2 text-xs font-semibold text-slate-900 bg-transparent border-none focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="px-2.5 py-2 text-slate-500 hover:text-sky-600 focus:outline-none transition-colors cursor-pointer shrink-0"
          title="Open calendar picker"
        >
          <span className="text-sm">📅</span>
        </button>
      </div>

      {/* Render Popover into Portal so table overflow never clips it */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
}
