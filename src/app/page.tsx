'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FormRenderer from '@/components/FormRenderer';
import { CommonProfile, CompleteFormData } from '@/types/form';
import CGHSCodePicker from '@/components/CGHSCodePicker';
import AuthModal from '@/components/AuthModal';
import { showSuccessAlert } from '@/lib/alerts';

export default function HomePage() {
  const [profile, setProfile] = useState<CommonProfile | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [activeClaimForPreview, setActiveClaimForPreview] = useState<CompleteFormData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string; id?: string; image?: string | null } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Rate search widget state
  const [selectedRate, setSelectedRate] = useState<any>(null);

  const loadData = () => {
    // Fetch profile
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
          }
        }
      })
      .catch((e) => console.error('Failed fetching profile', e));

    // Fetch user claims from Neon DB / API
    fetch('/api/user/claims')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setClaims(json.data);
        } else {
          setClaims([]);
        }
      })
      .catch((e) => console.error('Failed fetching claims', e))
      .finally(() => setLoadingClaims(false));
  };

  useEffect(() => {
    loadData();

    window.addEventListener('focus', loadData);
    window.addEventListener('dgehs-session-changed', loadData);
    return () => {
      window.removeEventListener('focus', loadData);
      window.removeEventListener('dgehs-session-changed', loadData);
    };
  }, []);

  const handlePrintClaim = (claim: any) => {
    if (claim.formData) {
      setActiveClaimForPreview(claim.formData);
      showSuccessAlert('Claim Loaded for Printing', `Loaded "${claim.title}" for 5-page PDF preview!`);
    }
  };

  const totalSubmitted = claims.filter((c) => c.status === 'SUBMITTED').length;
  const totalDrafts = claims.filter((c) => c.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* If user clicked a claim to print, render 5-page print view directly */}
        {activeClaimForPreview ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-sky-400 font-bold">Previewing 5-Page Printable Form</span>
              <button
                onClick={() => setActiveClaimForPreview(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                ← Return to Home Dashboard
              </button>
            </div>

            <FormRenderer
              data={activeClaimForPreview}
              onEdit={() => setActiveClaimForPreview(null)}
            />
          </div>
        ) : (
          <>
            {/* Hero Welcome Header */}
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
                  <span>🏛️ Directorate of Education, Govt. of NCT of Delhi</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Welcome, {profile?.employeeName || 'Govt Official'}
                </h1>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Manage your official DGEHS medical reimbursement claims, pre-fill static employee profiles, and generate pixel-perfect 5-page printable A4 PDF claim packages.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-slate-800/80 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">
                    Emp ID: <strong className="text-sky-400">{profile?.employeeId || '98241'}</strong>
                  </span>
                  <span className="bg-slate-800/80 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">
                    DGEHS Card: <strong className="text-emerald-400">{profile?.cardNo || 'DGEHS-DEL-98241'}</strong>
                  </span>
                  <span className="bg-slate-800/80 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">
                    Entitlement: <strong className="text-indigo-300">{profile?.entitlement || 'Pvt.'} Ward</strong>
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  href="/new-claim"
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-base">➕</span>
                  <span>Start New Medical Claim</span>
                </Link>

                <Link
                  href="/profile"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-base">👤</span>
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Submitted Claims
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{totalSubmitted}</div>
                <div className="text-[11px] text-slate-500 mt-1">Saved medical claims</div>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Saved Drafts
                </div>
                <div className="text-3xl font-extrabold text-amber-400">{totalDrafts}</div>
                <div className="text-[11px] text-slate-500 mt-1">In progress form packages</div>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Official Rate DB
                </div>
                <div className="text-3xl font-extrabold text-sky-400">1,998</div>
                <div className="text-[11px] text-slate-500 mt-1">CGHS Approved Procedure Rates</div>
              </div>
            </div>

            {/* Main Section Grid: Previous Forms & CGHS Rate Search */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column (2 Cols): Previous Forms & Saved Drafts List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>📂 Previous Forms &amp; Saved Drafts</span>
                    </h2>
                    <p className="text-xs text-slate-400">Click any claim to view, edit, or print the 5-page PDF</p>
                  </div>

                  <Link
                    href="/new-claim"
                    className="text-xs font-bold text-sky-400 hover:text-sky-300"
                  >
                    + Create New →
                  </Link>
                </div>

                {loadingClaims ? (
                  <div className="p-8 bg-slate-900/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 animate-pulse">
                    Loading claims...
                  </div>
                ) : claims.length === 0 ? (
                  <div className="p-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-center space-y-3">
                    <div className="text-3xl">📄</div>
                    <div className="text-sm font-bold text-slate-300">No Previous Medical Claims Found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Start your first DGEHS reimbursement application using our step-by-step 5-form wizard.
                    </p>
                    <Link
                      href="/new-claim"
                      className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      Start New Claim
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim) => (
                      <div
                        key={claim._id || claim.id || Math.random()}
                        className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{claim.title}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                claim.status === 'SUBMITTED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {claim.status || 'DRAFT'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Hospital: <strong className="text-slate-200">{claim.formData?.form4?.hospitalName || 'Max Hospital'}</strong></span>
                            <span>Patient: <strong className="text-slate-200">{claim.formData?.form4?.patientName || profile?.employeeName}</strong></span>
                            <span>Date: <strong className="text-slate-200">{new Date(claim.updatedAt || claim.createdAt || Date.now()).toLocaleDateString()}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handlePrintClaim(claim)}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                          >
                            <span>🖨️</span> Print 5-Page PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (1 Col): CGHS Code Rate Finder Widget */}
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🔍 CGHS Rate Lookup Tool</span>
                  </h2>
                  <p className="text-xs text-slate-400">Search CGHS code/treatment for NABH approved rates</p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <CGHSCodePicker
                    codeValue={selectedRate?.code || ''}
                    nameValue={selectedRate?.name || ''}
                    showDateAndRemarks={false}
                    onSelect={({ code, name, approvedRate }) => {
                      setSelectedRate({ code, name, approvedRate });
                    }}
                    placeholderCode="CGHS Code..."
                    placeholderName="Search treatment or investigation..."
                  />

                  {selectedRate ? (
                    <div className="p-4 bg-sky-950/40 border border-sky-800/50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                          Code: {selectedRate.code}
                        </span>
                        <span className="font-bold text-emerald-400">
                          Approved: ₹{selectedRate.approvedRate}
                        </span>
                      </div>
                      <div className="font-semibold text-white">{selectedRate.name}</div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                      Type CGHS code (e.g. LB123) or treatment name to query approved rates.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </>
        )}

      </main>

      {/* Sign-in Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => {
          loadData();
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}
