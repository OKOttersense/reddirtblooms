/**
 * Florist Forgot Password — /florist-forgot-password
 * Submits email; backend generates a reset token and notifies the owner to relay the link.
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Flower2, CheckCircle } from "lucide-react";

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

export default function FloristForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = trpc.floristAuth.requestPasswordReset.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message ?? "Something went wrong. Please try again."),
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

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="max-w-sm w-full text-center space-y-5">
          <CheckCircle size={52} className="mx-auto" style={{ color: C.gold }} />
          <h1 className="text-2xl font-bold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Check Your Email
          </h1>
          <p style={{ color: C.creamDim }}>
            If an account exists for <strong style={{ color: C.cream }}>{email}</strong>, a reset link has been sent.
            Check your inbox — the link expires in 1 hour.
          </p>
          <Link href="/florist-login">
            <button
              className="px-6 py-3 rounded font-semibold text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: C.gold, color: C.gold, background: "transparent" }}
            >
              Back to Login
            </button>
          </Link>
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
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: C.creamDim }}>
            Enter your email and we'll send a reset link.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) { toast.error("Please enter your email."); return; }
            resetMutation.mutate({ email });
          }}
          className="space-y-4"
          style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "0.75rem", padding: "2rem" }}
        >
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.creamDim }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@bloomco.com"
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: C.rust, color: C.cream }}
          >
            {resetMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Send Reset Link
          </button>

          <p className="text-xs text-center" style={{ color: C.creamDim }}>
            Remembered it?{" "}
            <Link href="/florist-login" style={{ color: C.gold, textDecoration: "underline" }}>
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
