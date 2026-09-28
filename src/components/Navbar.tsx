import React from "react";
import { Shield, Flame, CheckCircle2, AlertCircle, LogOut, User as UserIcon, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { firebaseConfig } from "../firebase";

interface NavbarProps {
  onOpenFirebaseInfo: () => void;
  activeAuthView: "login" | "register";
  setActiveAuthView: (view: "login" | "register") => void;
}

export function Navbar({ onOpenFirebaseInfo, activeAuthView, setActiveAuthView }: NavbarProps) {
  const { currentUser, emailVerified, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                SecureAuth
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                Firebase
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Firebase Auth &bull; Email Verification &bull; User Management
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Project info button */}
          <button
            onClick={onOpenFirebaseInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
            title="View Firebase SDK configuration & setup guide"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-700 hidden sm:inline">{firebaseConfig.projectId}</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Verification status pill */}
              <div
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  emailVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {emailVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unverified</span>
                  </>
                )}
              </div>

              {/* User badge */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || currentUser.email || "User"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50">
                    {(currentUser.displayName || currentUser.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.displayName || "User"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveAuthView("login")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeAuthView === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveAuthView("register")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeAuthView === "register"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
