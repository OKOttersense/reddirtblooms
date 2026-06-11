/**
 * Florist Dashboard — /florist-dashboard
 * Secure area for approved wholesale florists.
 * Shows: profile card, order history, account settings (edit profile + change password).
 * Redirects to /florist-login if not authenticated.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Flower2, LogOut, User, ShoppingBag, Settings,
  Loader2, ChevronRight, Package, ExternalLink, Edit2, Check, X, MessageSquare, Send
} from "lucide-react";

const C = {
  bg: "#0D0805",
  rust: "#B5451B",
  gold: "#D4A853",
  cream: "#F5F0E8",
  creamDim: "#C8C0B0",
  panel: "#1A1208",
  panelHover: "#201508",
  border: "#2A1F10",
  input: "#150F07",
  sage: "#7A8C6E",
};

type Tab = "overview" | "orders" | "suggestions" | "settings";

const STATUS_COLORS: Record<string, string> = {
  pending: "#D4A853",
  confirmed: "#7A8C6E",
  invoiced: "#5B8DD9",
  paid: "#4CAF50",
  cancelled: "#B5451B",
};

export default function FloristDashboard() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");

  // Auth check
  const meQuery = trpc.floristAuth.me.useQuery();
  const logoutMutation = trpc.floristAuth.logout.useMutation({
    onSuccess: () => navigate("/florist-login"),
  });

  // Orders
  const ordersQuery = trpc.floristPortal.myOrders.useQuery(undefined, {
    enabled: tab === "orders" && !!meQuery.data,
  });
  const utils = trpc.useUtils();

  // ── SSE: live order status updates ──────────────────────────────────
  useEffect(() => {
    if (!meQuery.data) return;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      es = new EventSource("/api/sse/orders");
      es.addEventListener("order-update", () => {
        utils.floristPortal.myOrders.invalidate();
        toast.info("Order status updated", { duration: 2500, position: "bottom-right" });
      });
      es.onerror = () => {
        es?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [!!meQuery.data]);

  // Suggestions state
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionCategory, setSuggestionCategory] = useState<"variety-request" | "feedback" | "special-order" | "general">("general");
  const suggestionsQuery = trpc.floristPortal.mySuggestions.useQuery(undefined, {
    enabled: tab === "suggestions" && !!meQuery.data,
  });
  const submitSuggestionMutation = trpc.floristPortal.submitSuggestion.useMutation({
    onSuccess: () => {
      toast.success("Suggestion submitted! We'll review it soon.");
      setSuggestionText("");
      suggestionsQuery.refetch();
    },
    onError: (err) => toast.error(err.message ?? "Submission failed."),
  });

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ contactName: "", phone: "", website: "" });
  const updateProfileMutation = trpc.floristAuth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated.");
      setEditing(false);
      meQuery.refetch();
    },
    onError: (err) => toast.error(err.message ?? "Update failed."),
  });

  // Change password state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!meQuery.isLoading && !meQuery.data) {
      navigate("/florist-login");
    }
  }, [meQuery.isLoading, meQuery.data]);

  // Pre-fill profile form when data loads
  useEffect(() => {
    if (meQuery.data) {
      setProfileForm({
        contactName: meQuery.data.contactName ?? "",
        phone: meQuery.data.phone ?? "",
        website: meQuery.data.website ?? "",
      });
    }
  }, [meQuery.data]);

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={32} className="animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  if (!meQuery.data) return null; // redirecting

  const florist = meQuery.data;

  const inputStyle: React.CSSProperties = {
    background: C.input,
    border: `1px solid ${C.border}`,
    color: C.cream,
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: C.border, background: C.panel }}
      >
        <div className="flex items-center gap-3">
          <Flower2 size={20} style={{ color: C.gold }} />
          <span className="font-semibold text-sm" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Red Dirt Blooms — Florist Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:block" style={{ color: C.creamDim }}>
            {florist.businessName}
          </span>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-opacity hover:opacity-80"
            style={{ borderColor: C.border, color: C.creamDim }}
          >
            <LogOut size={13} />
            Log Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome banner */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>
            Welcome back, {florist.contactName.split(" ")[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.creamDim }}>
            {florist.businessName} · Approved wholesale partner
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: C.border }}>
          {(["overview", "orders", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? C.gold : C.creamDim,
                borderBottom: tab === t ? `2px solid ${C.gold}` : "2px solid transparent",
                background: "transparent",
              }}
            >
              {t === "overview" && <User size={13} className="inline mr-1.5" />}
              {t === "orders" && <ShoppingBag size={13} className="inline mr-1.5" />}
              {t === "suggestions" && <MessageSquare size={13} className="inline mr-1.5" />}
              {t === "settings" && <Settings size={13} className="inline mr-1.5" />}
              {t === "suggestions" ? "Suggestions" : t}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profile card */}
            <div className="rounded-lg p-5 space-y-3" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                Your Account
              </h2>
              <div className="space-y-2 text-sm">
                <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Name: </span>{florist.contactName}</p>
                <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Email: </span>{florist.email}</p>
                {florist.phone && <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Phone: </span>{florist.phone}</p>}
                {florist.city && <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>City: </span>{florist.city}</p>}
                {florist.website && (
                  <p>
                    <a href={florist.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs"
                      style={{ color: C.gold }}>
                      {florist.website} <ExternalLink size={11} />
                    </a>
                  </p>
                )}
              </div>
              <button
                onClick={() => setTab("settings")}
                className="text-xs flex items-center gap-1 mt-2 transition-opacity hover:opacity-80"
                style={{ color: C.creamDim }}
              >
                Edit profile <ChevronRight size={12} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="rounded-lg p-5 space-y-3" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link href="/florist-portal">
                  <button
                    className="w-full text-left px-4 py-3 rounded text-sm flex items-center justify-between transition-colors"
                    style={{ background: C.panelHover, color: C.cream, border: `1px solid ${C.border}` }}
                  >
                    <span className="flex items-center gap-2">
                      <Package size={15} style={{ color: C.gold }} />
                      Browse This Week's Harvest
                    </span>
                    <ChevronRight size={14} style={{ color: C.creamDim }} />
                  </button>
                </Link>
                <button
                  onClick={() => setTab("orders")}
                  className="w-full text-left px-4 py-3 rounded text-sm flex items-center justify-between transition-colors"
                  style={{ background: C.panelHover, color: C.cream, border: `1px solid ${C.border}` }}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={15} style={{ color: C.gold }} />
                    View My Orders
                  </span>
                  <ChevronRight size={14} style={{ color: C.creamDim }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Orders Tab ───────────────────────────────────────────────── */}
        {tab === "orders" && (
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {ordersQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin" style={{ color: C.gold }} />
              </div>
            ) : !ordersQuery.data?.length ? (
              <div className="text-center py-16 space-y-2">
                <ShoppingBag size={36} className="mx-auto" style={{ color: C.border }} />
                <p className="text-sm" style={{ color: C.creamDim }}>No orders yet.</p>
                <Link href="/florist-portal">
                  <button className="text-xs mt-2 px-4 py-2 rounded transition-opacity hover:opacity-80"
                    style={{ background: C.rust, color: C.cream }}>
                    Browse This Week's Harvest
                  </button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: C.panel, borderBottom: `1px solid ${C.border}` }}>
                    {["Order #", "Date", "Items", "Total", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: C.creamDim }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ordersQuery.data.map((order: any, i: number) => (
                    <tr key={order.id}
                      style={{ background: i % 2 === 0 ? C.bg : C.panel, borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-3" style={{ color: C.cream }}>#{order.id}</td>
                      <td className="px-4 py-3" style={{ color: C.creamDim }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" style={{ color: C.creamDim }}>{order.itemCount ?? "—"}</td>
                      <td className="px-4 py-3" style={{ color: C.cream }}>
                        ${((order.totalAmountCents ?? 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            background: `${STATUS_COLORS[order.status] ?? C.border}22`,
                            color: STATUS_COLORS[order.status] ?? C.creamDim,
                          }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Suggestions Tab ──────────────────────────────────────────── */}
        {tab === "suggestions" && (
          <div className="space-y-6 max-w-lg">
            {/* Submit form */}
            <div className="rounded-lg p-5 space-y-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                Submit a Suggestion
              </h2>
              <p className="text-xs" style={{ color: C.creamDim }}>
                Request a variety, share feedback, or ask about a special order. We read every message.
              </p>
              <div>
                <label className="block text-xs mb-1" style={{ color: C.creamDim }}>Category</label>
                <select
                  value={suggestionCategory}
                  onChange={(e) => setSuggestionCategory(e.target.value as any)}
                  style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", outline: "none" }}
                >
                  <option value="variety-request">Variety Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="special-order">Special Order</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: C.creamDim }}>Message</label>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Tell us what you'd like to see, or ask about a special order..."
                  rows={4}
                  style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", outline: "none", resize: "vertical" }}
                />
              </div>
              <button
                onClick={() => submitSuggestionMutation.mutate({ message: suggestionText, category: suggestionCategory })}
                disabled={submitSuggestionMutation.isPending || suggestionText.trim().length < 5}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: C.rust, color: C.cream }}
              >
                {submitSuggestionMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit
              </button>
            </div>

            {/* Past suggestions */}
            <div className="rounded-lg p-5 space-y-3" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                Your Past Suggestions
              </h2>
              {suggestionsQuery.isLoading ? (
                <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin" style={{ color: C.gold }} /></div>
              ) : !suggestionsQuery.data?.length ? (
                <p className="text-xs" style={{ color: C.creamDim }}>No suggestions yet.</p>
              ) : (
                <div className="space-y-3">
                  {suggestionsQuery.data.map((s: any) => (
                    <div key={s.id} className="p-3 rounded" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: `${C.gold}22`, color: C.gold }}>
                          {s.category.replace("-", " ")}
                        </span>
                        <span className="text-xs" style={{ color: C.creamDim }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: C.cream, lineHeight: 1.6 }}>{s.message}</p>
                      <p className="text-xs mt-1 capitalize" style={{ color: s.status === "actioned" ? "#4CAF50" : s.status === "reviewed" ? C.gold : C.creamDim }}>
                        Status: {s.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Settings Tab ─────────────────────────────────────────────── */}
        {tab === "settings" && (
          <div className="space-y-6 max-w-lg">
            {/* Edit profile */}
            <div className="rounded-lg p-5 space-y-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                  Profile
                </h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
                    style={{ color: C.creamDim }}>
                    <Edit2 size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
                      style={{ color: C.creamDim }}>
                      <X size={12} /> Cancel
                    </button>
                    <button
                      onClick={() => updateProfileMutation.mutate(profileForm)}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-1 text-xs px-3 py-1 rounded transition-opacity hover:opacity-80"
                      style={{ background: C.rust, color: C.cream }}>
                      {updateProfileMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={12} />}
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: C.creamDim }}>Contact Name</label>
                    <input type="text" value={profileForm.contactName}
                      onChange={(e) => setProfileForm(f => ({ ...f, contactName: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: C.creamDim }}>Phone</label>
                    <input type="tel" value={profileForm.phone}
                      onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: C.creamDim }}>Website</label>
                    <input type="url" value={profileForm.website}
                      onChange={(e) => setProfileForm(f => ({ ...f, website: e.target.value }))}
                      style={inputStyle} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Name: </span>{florist.contactName}</p>
                  <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Email: </span>{florist.email}</p>
                  <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Phone: </span>{florist.phone || "—"}</p>
                  <p style={{ color: C.cream }}><span style={{ color: C.creamDim }}>Website: </span>{florist.website || "—"}</p>
                </div>
              )}
            </div>

            {/* Change password */}
            <div className="rounded-lg p-5 space-y-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                Change Password
              </h2>
              <p className="text-xs" style={{ color: C.creamDim }}>
                To change your password, use the{" "}
                <Link href="/florist-forgot-password" style={{ color: C.gold, textDecoration: "underline" }}>
                  forgot password
                </Link>{" "}
                flow — we'll send a secure reset link to your email.
              </p>
            </div>

            {/* Danger zone */}
            <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.rust}22` }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: C.rust }}>
                Session
              </h2>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded transition-opacity hover:opacity-80"
                style={{ background: `${C.rust}22`, color: C.rust, border: `1px solid ${C.rust}44` }}
              >
                <LogOut size={14} />
                Log Out of Florist Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
