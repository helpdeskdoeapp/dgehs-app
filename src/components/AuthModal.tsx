'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { parseGovEmail } from '@/lib/auth-helpers';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (session: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'oauth' | 'email'>('oauth');

  if (!isOpen) return null;

  const handleOAuthSignIn = (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    signIn(provider, { callbackUrl: window.location.href });
  };

  const handleDirectEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsed = parseGovEmail(email);
    if (!parsed.isValid) {
      showErrorAlert('Invalid Email', parsed.errorMessage || 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/gov-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName })
      });
      const data = await res.json();

      if (data.success && data.session) {
        showSuccessAlert('Signed In Successfully!', 'Welcome to the DGEHS Medical Claim Portal.');
        window.dispatchEvent(new Event('dgehs-session-changed'));
        if (onLoginSuccess) {
          onLoginSuccess(data.session);
        }
        onClose();
      } else {
        showErrorAlert('Sign In Failed', data.error || 'Failed to sign in. Please try again.');
      }
    } catch (err: any) {
      showErrorAlert('Sign In Error', err.message || 'Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xl shadow-lg mx-auto">
            DoE
          </div>
          <h2 className="text-xl font-bold text-white">Sign In to DGEHS Portal</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Access medical claims, manage your employee profile, and print official 5-form packages.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'oauth'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Social / OAuth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'email'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Instant Email Sign-In
          </button>
        </div>

        {/* Tab 1: OAuth Providers */}
        {activeTab === 'oauth' ? (
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (Any Account)</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              className="w-full bg-[#24292F] hover:bg-[#1a1e22] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 border border-slate-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('facebook')}
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('twitter')}
              className="w-full bg-black hover:bg-slate-950 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 border border-slate-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Continue with X (Twitter)</span>
            </button>
          </div>
        ) : (
          /* Tab 2: Universal Instant Email Sign-In */
          <form onSubmit={handleDirectEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-sky-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com, name@example.com"
                className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Accepts any email address. Works with both personal and official government emails.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                placeholder="e.g. Rajesh Kumar Sharma"
                className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>⚡ Continue with Instant Sign-In</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <span>Powered by Neon DB (PostgreSQL)</span>
            <span>•</span>
            <span className="text-emerald-400">Vercel Ready</span>
          </span>
        </div>
      </div>
    </div>
  );
}
