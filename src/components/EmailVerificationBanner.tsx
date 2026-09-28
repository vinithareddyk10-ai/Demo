import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Send, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../utils/authErrors";

export function EmailVerificationBanner() {
  const { currentUser, emailVerified, sendVerificationEmail, reloadUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Timer countdown for resending
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Don't render banner if no user or already verified
  if (!currentUser || emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setMessage(null);

    try {
      await sendVerificationEmail();
      setMessage({
        type: "success",
        text: `Verification link sent to ${currentUser.email}. Please check your inbox and spam folder.`
      });
      setCooldown(60); // 60 seconds rate-limit cooldown
    } catch (err: any) {
      setMessage({
        type: "error",
        text: getAuthErrorMessage(err)
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage(null);

    try {
      const isNowVerified = await reloadUser();
      if (isNowVerified) {
        setMessage({
          type: "success",
          text: "🎉 Congratulations! Your email is verified."
        });
      } else {
        setMessage({
          type: "info",
          text: "Email not yet verified. Please click the link sent to your inbox, then click 'Check Status' again."
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: getAuthErrorMessage(err)
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border-b border-amber-200/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-700 rounded-lg flex-shrink-0 mt-0.5">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-200/60 text-amber-800">
                Action Required
              </span>
              <h4 className="text-sm font-semibold text-amber-950">
                Verify your email address
              </h4>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              We sent a verification email to <strong className="font-semibold text-amber-950">{currentUser.email}</strong>. 
              Confirming your email secures your account and ensures you never lose access.
            </p>
            {message && (
              <div className={`mt-2 text-xs font-medium flex items-center gap-1.5 ${
                message.type === "success" ? "text-emerald-700" :
                message.type === "error" ? "text-rose-700" : "text-amber-800"
              }`}>
                {message.type === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {message.type === "error" && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-60"
            title="Reloads your user profile to check if you clicked the verification link"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Checking..." : "I've Verified"}</span>
          </button>

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isSending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
