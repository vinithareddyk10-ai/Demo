import React, { useState, useMemo } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Check, X, Shield, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../utils/authErrors";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onOpenFirebaseInfo: () => void;
}

export function RegisterForm({ onSwitchToLogin, onOpenFirebaseInfo }: RegisterFormProps) {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculations
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLen: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
  }, [password]);

  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLen) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: "", color: "bg-slate-200", textColor: "text-slate-400" };
    if (passwordStrengthScore <= 1) return { text: "Weak", color: "bg-rose-500", textColor: "text-rose-500" };
    if (passwordStrengthScore === 2) return { text: "Fair", color: "bg-amber-500", textColor: "text-amber-500" };
    if (passwordStrengthScore === 3) return { text: "Good", color: "bg-blue-500", textColor: "text-blue-500" };
    return { text: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
  }, [password, passwordStrengthScore]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please provide your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerWithEmail(email.trim(), password, name.trim());
      // Auth state will change automatically in AuthContext!
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Fast, secure registration with automatic email verification
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8">
        {/* Verification announcement banner */}
        <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
          <MailCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            Upon registration, Firebase Auth will dispatch an automated email verification link to verify your ownership.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{error}</span>
              {error.includes("Firebase Console") && (
                <button
                  type="button"
                  onClick={onOpenFirebaseInfo}
                  className="block mt-1 font-semibold text-rose-700 underline underline-offset-2 hover:text-rose-900"
                >
                  View Firebase Setup Guide &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              {password && (
                <span className={`text-xs font-bold ${strengthLabel.textColor}`}>
                  {strengthLabel.text}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="mt-2">
                <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                  <div className={`h-full ${passwordStrengthScore >= 1 ? strengthLabel.color : "bg-transparent"}`} />
                  <div className={`h-full ${passwordStrengthScore >= 2 ? strengthLabel.color : "bg-transparent"}`} />
                  <div className={`h-full ${passwordStrengthScore >= 3 ? strengthLabel.color : "bg-transparent"}`} />
                  <div className={`h-full ${passwordStrengthScore >= 4 ? strengthLabel.color : "bg-transparent"}`} />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasMinLen ? "text-emerald-600" : ""}`}>
                    {passwordCriteria.hasMinLen ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    8+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? "text-emerald-600" : ""}`}>
                    {passwordCriteria.hasUpper && passwordCriteria.hasLower ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    Aa letters
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-emerald-600" : ""}`}>
                    {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    Numbers
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? "text-emerald-600" : ""}`}>
                    {passwordCriteria.hasSpecial ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    Symbols
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  confirmPassword && !passwordsMatch
                    ? "border-rose-300 focus:ring-rose-500"
                    : confirmPassword && passwordsMatch
                    ? "border-emerald-300 focus:ring-emerald-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {passwordsMatch ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <X className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-[11px] text-rose-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="leading-snug">
                I agree to the Terms of Service, acknowledge email verification dispatch, and respect privacy policies.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering User...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Or register with</span>
          </div>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-60"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              Connecting to Google...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Account
            </>
          )}
        </button>

        {/* Switch to login */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
