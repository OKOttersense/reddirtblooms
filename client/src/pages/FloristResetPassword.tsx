/**
 * Florist Reset Password — /florist-reset-password?token=<hex>
 * Reads token from URL, lets florist set a new password.
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Flower2, CheckCircle, AlertCircle } from "lucide-react";

const C = {
  bg: "#0D0805",
  rust: "#B5451B",
  gold: "#D4A853",
  cream: "#F5F0E8",
  creamDim: "#C8C0B0",
  panel: "#1A1208",
  border: "#2A1F10",
  input: "#150F07",
};

export default function FloristResetPassword() {
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const resetMutation = trpc.floristAuth.resetPassword.useMutation({
    onSuccess: () => setDone(true),
    onError: (err) => toast.error(err.message ?? "Reset failed. The link may have expired."),
  });

  const inputStyle: React.CSSProperties = {
    background: C.input,
    border: `1px solid ${C.border}`,
    color: C.cream,
    width: "100%",
    padding: "0.625rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    outline: "none",
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="max-w-sm w-full text-center space-y-5">
          <AlertCircle size={52} className="mx-auto" style={{ color: C.rust }} />
          <h1 className="text-2xl font-bold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Invalid Reset Link
          </h1>
          <p style={{ color: C.creamDim }}>
            This reset link is missing or malformed. Please request a new one.
          </p>
          <Link href="/florist-forgot-password">
            <button
              className="px-6 py-3 rounded font-semibold text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: C.gold, color: C.gold, background: "transparent" }}
            >
              Request New Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="max-w-sm w-full text-center space-y-5">
          <CheckCircle size={52} className="mx-auto" style={{ color: C.gold }} />
          <h1 className="text-2xl font-bold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Password Updated!
          </h1>
          <p style={{ color: C.creamDim }}>
            Your password has been changed. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate("/florist-login")}
            className="px-6 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: C.rust, color: C.cream }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flower2 size={18} style={{ color: C.gold }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>
              Red Dirt Blooms
            </p>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Set New Password
          </h1>
          <p className="text-sm" style={{ color: C.creamDim }}>
            Choose a strong password for your florist account.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
            if (password !== confirmPassword) { toast.error("Passwords do not match."); return; }
            resetMutation.mutate({ token, newPassword: password });
          }}
          className="space-y-4"
          style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "0.75rem", padding: "2rem" }}
        >
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.creamDim }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.creamDim }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: C.rust, color: C.cream }}
          >
            {resetMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
