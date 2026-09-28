export function getAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = error.code || "";
  const message = error.message || "";

  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please double-check your credentials.";
    case "auth/user-not-found":
      return "No account found with this email address. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/email-already-in-use":
      return "This email address is already registered. Try logging in or use another email.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters with letters and numbers.";
    case "auth/operation-not-allowed":
      return "This sign-in provider is not enabled in the Firebase Console. Go to Firebase Console > Authentication > Sign-in method to enable Email/Password or Google.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access is temporarily blocked for security. Please try again in a few minutes or reset your password.";
    case "auth/user-disabled":
      return "This account has been disabled by an administrator.";
    case "auth/requires-recent-login":
      return "For security, you must re-authenticate before modifying sensitive account details. Please sign out and log back in.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completion. Please try again.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in credentials.";
    default:
      if (message) {
        // Strip out redundant Firebase error prefixes if present
        return message.replace(/^Firebase:\s*/, "").replace(/\s*\(auth\/[^)]+\)\.?$/, ".");
      }
      return "Authentication failed. Please verify your details and try again.";
  }
}
