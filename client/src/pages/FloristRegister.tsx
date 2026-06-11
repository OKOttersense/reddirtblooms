import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Flower2, Clock, Truck, Leaf, Star, Loader2, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

const STATS = [
  { value: "80%", label: "of US flowers are imported" },
  { value: "68%", label: "of consumers prefer local" },
  { value: "30–50%", label: "longer vase life, farm-direct" },
  { value: "10", label: "wholesale partners per season" },
];

const BENEFITS = [
  {
    icon: <Clock size={28} color={C.gold} />,
    title: "Cut to Order",
    desc: "Flowers are cut after you place your order — not weeks before. You get peak-freshness stems every time.",
  },
  {
    icon: <Truck size={28} color={C.gold} />,
    title: "Same-Week Delivery",
    desc: "Oklahoma-grown means no cold chain delays. Order Monday, receive by Friday. No jet lag.",
  },
  {
    icon: <Leaf size={28} color={C.gold} />,
    title: "No Minimums",
    desc: "Order what you need, when you need it. No contracts, no commitments, no minimums.",
  },
  {
    icon: <Star size={28} color={C.gold} />,
    title: "Priority Access",
    desc: "Partners get first pick of every harvest — before anything is posted publicly. You choose first.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Apply Below", desc: "Fill out the short form. We review every application personally." },
  { step: "02", title: "Get Approved", desc: "You'll hear back within 1–2 business days. We keep it small on purpose." },
  { step: "03", title: "Get Harvest Alerts", desc: "When something is ready, you get notified first — before anyone else." },
  { step: "04", title: "Order & Receive", desc: "Tell us what you need. We cut it, bundle it, and deliver same week." },
];

const VARIETIES = [
  { name: "Zinnias", season: "June–Oct", color: "#E8734A" },
  { name: "Sunflowers", season: "June–Sep", color: "#D4A853" },
  { name: "Celosia", season: "July–Oct", color: "#C94B7B" },
  { name: "Ornamental Basil", season: "June–Oct", color: "#7B3F6E" },
  { name: "Strawflower", season: "June–Oct", color: "#D4622A" },
];

export default function FloristRegister() {
  const [formData, setFormData] = useState({
    contactName: "",
    businessName: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (submitted) {
      // Trigger animation on next frame
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
    }
  }, [submitted]);

  const submitFloristApp = trpc.florist.submitApplication.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFloristApp.mutate(formData);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.cream, fontFamily: "system-ui, sans-serif" }}>
      {/* ── HERO + FORM (two-column) ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/manus-storage/hero_field_7ae29946.jpg)",
          backgroundSize: "cover", backgroundPosition: "center 40%",
          filter: "brightness(0.28)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(13,8,5,0.97) 50%, rgba(13,8,5,0.75) 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 32px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            {/* LEFT: copy */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(181,69,27,0.2)", border: `1px solid ${C.rust}`,
                borderRadius: 100, padding: "6px 16px", marginBottom: 24,
              }}>
                <Flower2 size={14} color={C.rust} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.rust, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Wholesale Partner Program
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(32px, 4.5vw, 56px)", fontWeight: 800, lineHeight: 1.1, color: C.cream, marginBottom: 24, fontFamily: "Georgia, serif" }}>
                Oklahoma Flowers.<br />
                <span style={{ color: C.gold }}>Cut This Morning.</span><br />
                On Your Table by Friday.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(245,240,232,0.85)", marginBottom: 32 }}>
                Join our network of florists, designers, and event planners who get first access to peak-harvest stems. No minimums. Same-week delivery. Unmatched freshness.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: <Clock size={16} color={C.gold} />, text: "Cut to order — peak freshness every time" },
                  { icon: <Truck size={16} color={C.gold} />, text: "Same-week delivery, Oklahoma-grown" },
                  { icon: <Leaf size={16} color={C.gold} />, text: "No minimums, no contracts" },
                  { icon: <Star size={16} color={C.gold} />, text: "Priority harvest access before public" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.creamDim }}>
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: application form */}
            <div style={{ background: "rgba(26,18,8,0.92)", border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, backdropFilter: "blur(8px)" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.cream, marginBottom: 8 }}>Apply to Partner With Us</h2>
                <p style={{ fontSize: 13, color: C.creamDim, lineHeight: 1.5 }}>
                  We review every application personally and respond within 1–2 business days.
                </p>
              </div>

              {submitted ? (
                <div style={{
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  textAlign: "center",
                  padding: "24px 0",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(122,140,110,0.2)",
                    border: "2px solid #7A8C6E",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "scale(1)" : "scale(0.5)",
                    transition: "opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s",
                  }}>
                    <CheckCircle2 size={32} color="#7A8C6E" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.cream, marginBottom: 10 }}>Application Received!</div>
                  <p style={{ fontSize: 14, color: C.creamDim, lineHeight: 1.6, marginBottom: 20 }}>
                    Thank you, <strong style={{ color: C.cream }}>{formData.contactName || "there"}</strong>!{" "}
                    We've received your application for <strong style={{ color: C.cream }}>{formData.businessName}</strong> and will be in touch within 1–2 business days.
                  </p>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "14px 16px", textAlign: "left", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>What happens next</div>
                    {[
                      { icon: <Mail size={13} />, text: "Confirmation sent to " + formData.email },
                      { icon: <Clock size={13} />, text: "Review within 1–2 business days" },
                      { icon: <ArrowRight size={13} />, text: "Approval email with portal login" },
                    ].map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.creamDim, marginBottom: 6 }}>
                        <span style={{ color: C.gold, marginTop: 1, flexShrink: 0 }}>{step.icon}</span>
                        <span>{step.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/">
                    <span style={{ display: "inline-block", background: "transparent", border: `1px solid ${C.border}`, color: C.creamDim, padding: "10px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Back to Home</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.creamDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Contact Name <span style={{ color: "#FF6B6B" }}>*</span></label>
                      <input type="text" className="florist-form-field" placeholder="Jane Smith" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} required style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.creamDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Business Name <span style={{ color: "#FF6B6B" }}>*</span></label>
                      <input type="text" className="florist-form-field" placeholder="Bloom & Co." value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.creamDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Email <span style={{ color: "#FF6B6B" }}>*</span></label>
                      <input type="email" className="florist-form-field" placeholder="jane@bloomco.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.creamDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Phone <span style={{ color: "#FF6B6B" }}>*</span></label>
                      <input type="tel" className="florist-form-field" placeholder="(405) 555-0123" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="text" className="florist-form-field" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                    <input type="url" className="florist-form-field" placeholder="Website (optional)" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                  </div>
                  <textarea className="florist-form-field" placeholder="Tell us about your business and why you'd like to partner with us" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} style={{ background: C.input, border: `1px solid ${C.border}`, color: C.cream, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "none" }} />
                  <button type="submit" disabled={submitFloristApp.isPending} style={{ background: submitFloristApp.isPending ? "rgba(181,69,27,0.5)" : C.rust, color: C.cream, border: "none", padding: "12px 16px", fontSize: 15, fontWeight: 700, borderRadius: 8, cursor: submitFloristApp.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {submitFloristApp.isPending && <Loader2 size={16} className="animate-spin" />}
                    {submitFloristApp.isPending ? "Submitting..." : "Submit Application"}
                  </button>
                  {submitFloristApp.isError && (
                    <div style={{ color: "#FF6B6B", fontSize: 13, textAlign: "center" }}>Error: {submitFloristApp.error?.message}</div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: C.gold, marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: C.creamDim }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENEFITS ── */}
      <div style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: C.cream }}>
          Why Partner With Red Dirt Blooms
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
              <div style={{ marginBottom: 16 }}>{b.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: C.cream }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: C.creamDim, lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── VARIETIES ── */}
      <div style={{ padding: "64px 32px", background: C.panel, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: C.cream }}>
            What We Grow
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {VARIETIES.map((v, i) => (
              <div key={i} style={{
                background: C.bg, border: `2px solid ${v.color}`, borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: v.color, marginBottom: 8 }}>{v.name}</div>
                <div style={{ fontSize: 12, color: C.creamDim }}>{v.season}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 48, textAlign: "center", color: C.cream }}>
          How It Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {HOW_IT_WORKS.map((h, i) => (
            <div key={i}>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, marginBottom: 12 }}>{h.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: C.cream }}>{h.title}</h3>
              <p style={{ fontSize: 14, color: C.creamDim, lineHeight: 1.6 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <Link href="/florist-login"><span style={{ fontSize: 14, color: C.creamDim, cursor: "pointer", textDecoration: "underline" }}>Already have an account? Log in</span></Link>
          <Link href="/florist-portfolio"><span style={{ fontSize: 14, color: C.creamDim, cursor: "pointer", textDecoration: "underline" }}>View our portfolio</span></Link>
        </div>
        <p style={{ fontSize: 12, color: C.creamDim }}>© 2025 Red Dirt Blooms. All rights reserved.</p>
      </div>
    </div>
  );
}
