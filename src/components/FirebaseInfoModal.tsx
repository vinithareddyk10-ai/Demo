import React from "react";
import { X, ExternalLink, ShieldCheck, Flame, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { firebaseConfig } from "../firebase";

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseInfoModal({ isOpen, onClose }: FirebaseInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Firebase Auth Configuration</h3>
              <p className="text-xs text-slate-500">Connected to Project: <span className="font-mono text-slate-700 font-medium">{firebaseConfig.projectId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Quick Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-900 text-xs leading-relaxed">
              <p className="font-medium text-blue-950 mb-1">Live Firebase Integration</p>
              This application is configured directly with your Firebase Web project credentials. User registrations, logins, email verifications, and password resets are executed directly on your Firebase Auth instance.
            </div>
          </div>

          {/* Console Checklist */}
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Firebase Console Prerequisites Checklist
            </h4>
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">Email/Password Provider:</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Make sure <strong>Email/Password</strong> is enabled in Firebase Console &rarr; Authentication &rarr; Sign-in method.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">Email Verification Action URL:</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Firebase generates and sends an official email verification link from Firebase's secure mailer (noreply@fir-3482b.firebaseapp.com).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">Google Sign-In (Optional):</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enable Google provider in Firebase Console if you wish to use one-click Google OAuth authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Config Details */}
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-2">Active SDK Configuration</h4>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{JSON.stringify({
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket,
                appId: firebaseConfig.appId,
                apiKey: `${firebaseConfig.apiKey.slice(0, 8)}...${firebaseConfig.apiKey.slice(-6)}`
              }, null, 2)}</pre>
            </div>
          </div>

          {/* Direct link to console */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Manage registered users in Firebase Console
            </span>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
            >
              Open Users Panel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
