'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: sessionData, status: sessionStatus } = useSession();
  const [customSession, setCustomSession] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const json = await res.json();
      if (json.isLoggedIn && json.session) {
        setCustomSession(json.session);
      } else {
        setCustomSession(null);
      }
    } catch (e) {
      console.error('Session fetch error', e);
    }
  };

  useEffect(() => {
    checkSession();
    window.addEventListener('focus', checkSession);
    window.addEventListener('dgehs-session-changed', checkSession);
    return () => {
      window.removeEventListener('focus', checkSession);
      window.removeEventListener('dgehs-session-changed', checkSession);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthenticated = sessionStatus === 'authenticated' || (customSession && customSession.isLoggedIn);
  const user = sessionData?.user || (customSession ? {
    name: `${customSession.firstName || 'Rajesh'} Kumar`,
    email: customSession.email || '98241.rajesh@doe.delhi.gov.in',
    employeeId: customSession.employeeId || '98241',
    image: null
  } : null);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setCustomSession(null);
    await fetch('/api/auth/gov-logout', { method: 'POST' });
    window.dispatchEvent(new Event('dgehs-session-changed'));
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform">
              DoE
            </div>
            <div>
              <div className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                Directorate of Education — Delhi
              </div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                DGEHS Medical Claim Portal
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === '/'
                ? 'bg-sky-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🏠</span> Dashboard
          </Link>

          <Link
            href="/new-claim"
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === '/new-claim'
                ? 'bg-sky-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>➕</span> New Medical Claim
          </Link>

          <Link
            href="/profile"
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === '/profile'
                ? 'bg-sky-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>👤</span> My Profile
          </Link>
        </div>

        {/* User Authentication Status / User Dropdown */}
        <div ref={dropdownRef} className="relative text-xs">
          {isAuthenticated && user ? (
            /* User Avatar Button (Replaces Sign In button) */
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-1.5 pl-3 rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <div className="flex flex-col text-right leading-none hidden sm:block">
                <span className="font-bold text-white text-[11px] truncate max-w-[120px]">{user.name}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">{user.email}</span>
              </div>

              {user.image ? (
                <img src={user.image} alt="User Avatar" className="w-8 h-8 rounded-full border border-sky-400" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user.name?.charAt(0) || '👤'}
                </div>
              )}

              <span className="text-[10px] text-slate-400 font-bold pr-1">▼</span>
            </button>
          ) : (
            /* Sign In Button when Signed Out */
            <button
              type="button"
              onClick={() => signIn('google')}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}

          {/* User Popover Dropdown Menu */}
          {dropdownOpen && isAuthenticated && user && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-white animate-fadeIn divide-y divide-slate-800">
              
              {/* Header Info */}
              <div className="p-3">
                <div className="font-bold text-sm text-white">{user.name}</div>
                <div className="text-xs text-slate-400 font-mono truncate">{user.email}</div>
                {(user as any).employeeId && (
                  <div className="mt-1.5 inline-block text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md">
                    Emp ID: {(user as any).employeeId}
                  </div>
                )}
              </div>

              {/* Menu Links */}
              <div className="py-1 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span className="text-base">👤</span>
                  <span>Employee Profile</span>
                </Link>

                <Link
                  href="/new-claim"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span className="text-base">➕</span>
                  <span>New Medical Claim Form</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span className="text-base">📂</span>
                  <span>Dashboard &amp; My Claims</span>
                </Link>
              </div>

              {/* Sign Out Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-xs font-bold text-rose-400 transition-colors text-left"
                >
                  <span className="text-base">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
