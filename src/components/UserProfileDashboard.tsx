import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Flame,
  FileCode,
  Calendar,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../utils/authErrors";
import { firebaseConfig } from "../firebase";

export function UserProfileDashboard() {
  const {
    currentUser,
    emailVerified,
    logout,
    sendVerificationEmail,
    reloadUser,
    updateUserProfile,
    updateUserPassword,
    deleteAccount,
    resetPassword
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "token" | "danger">("profile");

  // Profile Form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email verification cooldown
  const [cooldown, setCooldown] = useState(0);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Feedback notifications
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Token inspector
  const [idTokenInfo, setIdTokenInfo] = useState<{
    token: string;
    authTime?: string;
    issuedAt?: string;
    expirationTime?: string;
    signInProvider?: string;
  } | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateUserProfile(displayName, photoURL);
      showToast("success", "Profile updated successfully!");
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      showToast("success", "Password updated successfully!");
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    if (cooldown > 0 || isSendingVerification) return;
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      setCooldown(60);
      showToast("success", `Verification email dispatched to ${currentUser?.email}.`);
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      const verified = await reloadUser();
      if (verified) {
        showToast("success", "Email verification confirmed! Account status updated.");
      } else {
        showToast("info", "Email is still unverified. Please click the link in your email and try again.");
      }
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    } finally {
      setIsReloading(false);
    }
  };

  const handleSendPasswordResetSelf = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      showToast("success", `Password reset link dispatched to ${currentUser.email}.`);
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    }
  };

  const handleFetchToken = async () => {
    if (!currentUser) return;
    setIsFetchingToken(true);
    try {
      const tokenResult = await currentUser.getIdTokenResult(true);
      setIdTokenInfo({
        token: tokenResult.token,
        authTime: tokenResult.authTime,
        issuedAt: tokenResult.issuedAtTime,
        expirationTime: tokenResult.expirationTime,
        signInProvider: tokenResult.signInProvider || "password"
      });
      showToast("success", "Firebase ID Token fetched and refreshed!");
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
    } finally {
      setIsFetchingToken(false);
    }
  };

  const handleCopyUid = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard.writeText(currentUser.uid);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  };

  const handleCopyToken = () => {
    if (!idTokenInfo?.token) return;
    navigator.clipboard.writeText(idTokenInfo.token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== "DELETE") {
      showToast("error", "Please type DELETE to confirm.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      // user will automatically be logged out and state cleared
    } catch (err: any) {
      showToast("error", getAuthErrorMessage(err));
      setIsDeleting(false);
    }
  };

  if (!currentUser) return null;

  const creationDate = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleString()
    : "Unknown";
  const lastLoginDate = currentUser.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString()
    : "Unknown";

  const providerId = currentUser.providerData[0]?.providerId || "password";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {toast.type === "info" && <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="font-medium">{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-100">
                  {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {emailVerified ? (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white"
                  title="Verified Account"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-white rounded-full ring-2 ring-white"
                  title="Unverified Account"
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Name & Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentUser.displayName || "Authenticated User"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    emailVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {emailVerified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Email Verified
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Email Unverified
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  UID: {currentUser.uid.slice(0, 12)}...
                </span>
                <button
                  onClick={handleCopyUid}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 hover:underline"
                  title="Copy full UID"
                >
                  {uidCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{uidCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!emailVerified && (
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} />
                <span>Check Verification</span>
              </button>
            )}
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          Profile &amp; Details
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "security"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Key className="w-4 h-4" />
          Security &amp; Password
        </button>
        <button
          onClick={() => setActiveTab("token")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "token"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Auth Token &amp; Diagnostics
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "danger"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-rose-600"
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </button>
      </div>

      {/* Tab 1: Profile & Details */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Edit Profile Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Avatar Photo URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Or pick a preset avatar below:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoURL(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                        photoURL === url ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200"
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {photoURL && (
                    <button
                      type="button"
                      onClick={() => setPhotoURL("")}
                      className="text-xs text-slate-400 hover:text-slate-600 underline ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email (Managed by Firebase)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ""}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Account Meta Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Account Metadata
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-0.5">Primary Provider</span>
                <span className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  {providerId}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-0.5">Account Created</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {creationDate}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-0.5">Last Signed In</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {lastLoginDate}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block mb-0.5">Firebase Project</span>
                <span className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {firebaseConfig.projectId}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Verification Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Email Verification
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  emailVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {emailVerified ? "Active & Verified" : "Verification Pending"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Email verification ensures that the email address associated with this account is authentic.
                It protects your identity, enables password recovery, and prevents unauthorized takeovers.
              </p>
              <div className="text-xs font-medium text-slate-700">
                Registered Email: <span className="font-mono text-indigo-600">{currentUser.email}</span>
              </div>
            </div>

            <div className="space-y-3">
              {emailVerified ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Your email address has been verified. No further action needed!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Click the button below to resend a verification link to your inbox. Check your spam folder if it doesn't arrive within 2 minutes.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendVerification}
                      disabled={cooldown > 0 || isSendingVerification}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {isSendingVerification ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReload}
                      disabled={isReloading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} />
                      Check Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Update Password
            </h3>

            {providerId !== "password" ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Third-party Authentication</p>
                You are signed in via <strong>{providerId}</strong>. Password changes are managed through your identity provider.
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendPasswordResetSelf}
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Send reset email instead
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Auth Token & Diagnostics */}
      {activeTab === "token" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                Firebase ID Token &amp; Session Claims
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Inspect JWT claims issued by Firebase Auth for this authenticated session.
              </p>
            </div>
            <button
              onClick={handleFetchToken}
              disabled={isFetchingToken}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
            >
              {isFetchingToken ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Retrieving Token...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Fetch ID Token
                </>
              )}
            </button>
          </div>

          {idTokenInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Issued At</span>
                  <span className="font-semibold text-slate-800">{idTokenInfo.issuedAt}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Expires At</span>
                  <span className="font-semibold text-slate-800">{idTokenInfo.expirationTime}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Sign-in Provider</span>
                  <span className="font-semibold text-slate-800 capitalize">{idTokenInfo.signInProvider}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Raw JWT Token</label>
                  <button
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {tokenCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{tokenCopied ? "Copied!" : "Copy Token"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto break-all max-h-48">
                  {idTokenInfo.token}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No token loaded in view</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Fetch ID Token" to refresh and display the active session claims and JWT bearer string.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Danger Zone */}
      {activeTab === "danger" && (
        <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Irreversible actions that affect your Firebase Auth user record.
            </p>
          </div>

          <div className="p-5 border border-rose-200 rounded-xl bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Delete Account</h4>
              <p className="text-xs text-slate-500 mt-1">
                Permanently delete this user record from Firebase Auth (<span className="font-mono">{currentUser.uid}</span>). All credentials and profile data will be erased.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Account Permanently?</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This action cannot be reversed. To confirm, please type <strong className="text-rose-600 font-bold">DELETE</strong> into the field below.
            </p>
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationInput("");
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationInput !== "DELETE" || isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Deletion"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
