'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { CommonProfile, CompleteFormData } from '@/types/form';
import { parseGovEmail } from '@/lib/auth-helpers';
import AuthModal from './AuthModal';

interface GovAuthHeaderProps {
  formData: CompleteFormData;
  onProfileLoaded: (profile: CommonProfile) => void;
  onClaimLoaded: (claimData: CompleteFormData) => void;
}

export default function GovAuthHeader({
  formData,
  onProfileLoaded,
  onClaimLoaded
}: GovAuthHeaderProps) {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [customSession, setCustomSession] = useState<any>(null);

  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Drafts list modal state
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const json = await res.json();
      if (json.isLoggedIn && json.session) {
        setCustomSession(json.session);
        if (json.session.profile) {
          onProfileLoaded(json.session.profile);
        }
      } else {
        setCustomSession(null);
      }
    } catch (e) {
      console.error('Session fetch error', e);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (sessionData && (sessionData as any).profile) {
      onProfileLoaded((sessionData as any).profile);
    }
  }, [sessionData]);

  const handleDevEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/gov-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const json = await res.json();

      if (json.success && json.session) {
        setCustomSession(json.session);
        setStatusMsg(json.message);
        window.dispatchEvent(new Event('dgehs-session-changed'));
        if (json.session.profile) {
          onProfileLoaded(json.session.profile);
        }
      } else {
        setErrorMsg(json.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setCustomSession(null);
    await fetch('/api/auth/gov-logout', { method: 'POST' });
    window.dispatchEvent(new Event('dgehs-session-changed'));
    signOut({ callbackUrl: '/' });
  };

  const handleSaveProfileToNeon = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.profile)
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg('Static employee profile saved to Neon DB (PostgreSQL)!');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed saving profile', e);
    }
  };

  const handleSaveDraft = async (status: 'DRAFT' | 'SUBMITTED' = 'DRAFT') => {
    setSavingDraft(true);
    try {
      const res = await fetch('/api/user/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Claim - ${formData.profile.employeeName || 'Draft'} (${new Date().toLocaleDateString()})`,
          status,
          formData
        })
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg(json.message);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed saving draft', e);
    } finally {
      setSavingDraft(false);
    }
  };

  const fetchClaimsList = async () => {
    setShowDraftsModal(true);
    try {
      const res = await fetch('/api/user/claims');
      const json = await res.json();
      if (json.success) {
        setClaimsList(json.data || []);
      }
    } catch (e) {
      console.error('Failed fetching claims list', e);
    }
  };

  const liveParsed = emailInput ? parseGovEmail(emailInput) : { isValid: false, employeeId: '' };
  const isAuthenticated = sessionStatus === 'authenticated' || !!(customSession && customSession.isLoggedIn);
  const userObj = sessionData?.user || (customSession?.user ? {
    name: customSession.profile?.employeeName || customSession.user.name || 'Gov Official',
    email: customSession.user.email || customSession.email,
    employeeId: customSession.profile?.employeeId || customSession.employeeId || customSession.user.id?.substring(0, 8),
    image: customSession.user.image || null
  } : (customSession?.profile ? {
    name: customSession.profile.employeeName || 'Gov Official',
    email: customSession.profile.email,
    employeeId: customSession.profile.employeeId,
    image: null
  } : null));

  return (
    <div className="no-print bg-slate-900 border-b border-slate-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">

        {/* Left: Department Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            DoE
          </div>
          <div>
            <div className="text-xs font-bold text-sky-400 tracking-wider uppercase">
              Directorate of Education — Delhi Gov
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              DGEHS Claims Portal
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Neon DB Active
              </span>
            </h1>
          </div>
        </div>

        {/* Center/Right: Authentication Controls */}
        {isAuthenticated && userObj ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2.5">
              {(userObj as any).image ? (
                <img src={(userObj as any).image} alt="Avatar" className="w-7 h-7 rounded-full border border-sky-400 object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
                  {userObj.name?.charAt(0) || 'E'}
                </div>
              )}
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{userObj.name}</span>
                  {(userObj as any).employeeId && (
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-1.5 py-0.5 rounded">
                      ID: {(userObj as any).employeeId}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{userObj.email}</div>
              </div>
            </div>

            <button
              onClick={handleSaveProfileToNeon}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>💾</span> Save Profile to Neon DB
            </button>

            <button
              onClick={() => handleSaveDraft('DRAFT')}
              disabled={savingDraft}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              {savingDraft ? 'Saving...' : '📝 Save Claim Draft'}
            </button>

            <button
              onClick={fetchClaimsList}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl"
            >
              📂 Saved Drafts
            </button>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 px-2 py-1 font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

            {/* Multi-Provider Modal Trigger */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In (Google, X, FB, GitHub, Email)</span>
            </button>

            <div className="hidden sm:block text-slate-500 text-xs font-semibold">OR</div>

            {/* Direct Instant Email Input */}
            <form onSubmit={handleDevEmailLogin} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter any email address..."
                  className="w-full sm:w-64 p-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                {liveParsed.isValid && (
                  <div className="absolute right-2 top-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                    ID: {liveParsed.employeeId}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !emailInput}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all whitespace-nowrap disabled:opacity-50"
              >
                Instant Login
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Notifications / Errors */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto mt-2 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs px-4 py-2 rounded-xl flex justify-between items-center">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}

      {statusMsg && (
        <div className="max-w-7xl mx-auto mt-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs px-4 py-2 rounded-xl flex justify-between items-center animate-fadeIn">
          <span>✅ {statusMsg}</span>
          <button onClick={() => setStatusMsg('')}>✕</button>
        </div>
      )}

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-sky-900">Saved Drafts &amp; Submissions (Neon DB)</h3>
              <button onClick={() => setShowDraftsModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {claimsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No saved drafts found in Neon DB. Click "Save Claim Draft" to save your work!
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {claimsList.map((claim) => (
                  <div
                    key={claim._id || claim.id}
                    className="p-3 border border-slate-200 rounded-xl hover:bg-sky-50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{claim.title}</div>
                      <div className="text-[10px] text-slate-400">
                        Updated: {new Date(claim.updatedAt || claim.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (claim.formData) {
                          onClaimLoaded(claim.formData);
                          setStatusMsg(`Loaded "${claim.title}"!`);
                          setShowDraftsModal(false);
                        }
                      }}
                      className="bg-sky-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-sky-700"
                    >
                      Load Form
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Provider Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(sess) => {
          setCustomSession(sess);
          if (sess.profile) {
            onProfileLoaded(sess.profile);
          }
        }}
      />
    </div>
  );
}
