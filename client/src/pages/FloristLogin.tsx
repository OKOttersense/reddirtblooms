/**
 * Florist Login — /florist-login
 * Email + password login for approved wholesale florists.
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Flower2 } from "lucide-react";

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

export default function FloristLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const loginMutation = trpc.floristAuth.login.useMutation({
    onSuccess: () => navigate("/florist-portal"),
    onError: (err) => {
      // Detect pending status — show a dedicated screen instead of a toast
      if (err.message?.toLowerCase().includes("pending")) {
        setPendingEmail(email);
      } else {
        toast.error(err.message ?? "Login failed. Please try again.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    loginMutation.mutate({ email, password });
  }

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

  // Pending approval screen
  if (pendingEmail) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: C.bg }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Flower2 size={18} style={{ color: C.gold }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>
              Red Dirt Blooms
            </p>
          </div>
          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: "0.75rem",
              padding: "2.5rem 2rem",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#D4A85320", border: `1px solid ${C.gold}40` }}
            >
              <Flower2 size={28} style={{ color: C.gold }} />
            </div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}
            >
              Application Under Review
            </h2>
            <p className="text-sm mb-4" style={{ color: C.creamDim, lineHeight: 1.7 }}>
              Your application for <strong style={{ color: C.cream }}>{pendingEmail}</strong> is
              currently being reviewed. We typically respond within 24–48 hours.
            </p>
            <p className="text-sm mb-6" style={{ color: C.creamDim, lineHeight: 1.7 }}>
              You'll receive an email with your login credentials once approved. In the meantime,
              feel free to browse our portfolio.
            </p>
            <div className="space-y-3">
              <Link
                href="/florist-portfolio"
                className="block w-full py-2.5 rounded text-sm font-semibold text-center"
                style={{ background: C.rust, color: C.cream }}
              >
                Browse the Portfolio
              </Link>
              <button
                onClick={() => setPendingEmail(null)}
                className="block w-full py-2.5 rounded text-sm text-center"
                style={{ color: C.creamDim, border: `1px solid ${C.border}` }}
              >
                Try a Different Account
              </button>
            </div>
          </div>
          <p className="text-center text-xs mt-6" style={{ color: C.creamDim }}>
            <Link href="/" style={{ color: C.creamDim }}>
              ← Back to Red Dirt Blooms
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: C.bg }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flower2 size={18} style={{ color: C.gold }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>
              Red Dirt Blooms
            </p>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}
          >
            Florist Portal Login
          </h1>
          <p className="text-sm" style={{ color: C.creamDim }}>
            Approved wholesale partners only.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: "0.75rem",
            padding: "2rem",
          }}
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

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: C.creamDim }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: C.rust, color: C.cream }}
          >
            {loginMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Log In
          </button>

          <p className="text-xs text-center" style={{ color: C.creamDim }}>
            Not yet a partner?{" "}
            <Link href="/florist-register" style={{ color: C.gold, textDecoration: "underline" }}>
              Apply for wholesale access
            </Link>
          </p>
          <p className="text-xs text-center" style={{ color: C.creamDim }}>
            <Link href="/florist-forgot-password" style={{ color: C.creamDim, textDecoration: "underline" }}>
              Forgot your password?
            </Link>
          </p>
          <p className="text-xs text-center" style={{ color: C.creamDim }}>
            Want to browse first?{" "}
            <Link href="/florist-portfolio" style={{ color: C.gold, textDecoration: "underline" }}>
              View our portfolio
            </Link>
          </p>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: C.creamDim }}>
          <Link href="/" style={{ color: C.creamDim }}>
            ← Back to Red Dirt Blooms
          </Link>
        </p>
      </div>
    </div>
  );
}
