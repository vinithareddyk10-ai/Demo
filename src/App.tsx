/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { EmailVerificationBanner } from "./components/EmailVerificationBanner";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { UserProfileDashboard } from "./components/UserProfileDashboard";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { FirebaseInfoModal } from "./components/FirebaseInfoModal";
import { firebaseConfig } from "./firebase";
import {
  ShieldCheck,
  MailCheck,
  KeyRound,
  Flame,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";

function MainContent() {
  const { currentUser, loading } = useAuth();
  const [activeAuthView, setActiveAuthView] = useState<"login" | "register">("login");
  const [isFirebaseInfoOpen, setIsFirebaseInfoOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordDefaultEmail, setForgotPasswordDefaultEmail] = useState("");

  const handleOpenForgotPassword = (email: string) => {
    setForgotPasswordDefaultEmail(email);
    setIsForgotPasswordOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Connecting to Firebase Auth...
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {firebaseConfig.projectId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Navigation */}
      <Navbar
        onOpenFirebaseInfo={() => setIsFirebaseInfoOpen(true)}
        activeAuthView={activeAuthView}
        setActiveAuthView={setActiveAuthView}
      />

      {/* Body */}
      <main className="flex-1">
        {currentUser ? (
          /* Authenticated Dashboard View */
          <UserProfileDashboard />
        ) : (
          /* Unauthenticated Auth Page View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Prop & Security Highlights */}
              <div className="lg:col-span-6 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Live Firebase Authentication
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                    Secure User Identity &amp;{" "}
                    <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                      Email Verification
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
                    Production-ready authentication system connected directly to Firebase project{" "}
                    <code className="px-1.5 py-0.5 rounded bg-slate-200/80 font-mono text-indigo-700 font-semibold text-sm">
                      {firebaseConfig.projectId}
                    </code>
                    . Includes automated email verification, password strength auditing, session claims, and secure profile management.
                  </p>
                </div>

                {/* Key Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <MailCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Email Verification</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Automated verification links sent via Firebase mailer with cooldown protection and live status reloading.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Bcrypt &amp; Argon Hashing</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Client credentials secured by Google's hardened identity infrastructure and zero-trust protocol.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Password Reset Flow</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        One-click password recovery links delivered straight to user inboxes with rate limiting.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">User Management</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Full profile customization, avatar selection, live JWT token inspection, and account deletion.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Firebase Console helper */}
                <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-amber-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Firebase Console</h4>
                      <p className="text-[11px] text-slate-400">Manage registered users in project {firebaseConfig.projectId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFirebaseInfoOpen(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    Setup Details
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Right Column: Form Container */}
              <div className="lg:col-span-6 flex justify-center">
                {activeAuthView === "login" ? (
                  <LoginForm
                    onSwitchToRegister={() => setActiveAuthView("register")}
                    onOpenForgotPassword={handleOpenForgotPassword}
                    onOpenFirebaseInfo={() => setIsFirebaseInfoOpen(true)}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setActiveAuthView("login")}
                    onOpenFirebaseInfo={() => setIsFirebaseInfoOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SecureAuth</span>
            <span>&bull;</span>
            <span>Firebase Auth Web SDK v{firebaseConfig.appId.split(":")[0] || "10"}+</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsFirebaseInfoOpen(true)}
              className="hover:text-indigo-600 transition-colors"
            >
              Configuration Info
            </button>
            <a
              href="https://firebase.google.com/docs/auth/web/manage-users"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
            >
              Firebase Auth Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={forgotPasswordDefaultEmail}
      />

      <FirebaseInfoModal
        isOpen={isFirebaseInfoOpen}
        onClose={() => setIsFirebaseInfoOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
