/**
 * BloomBoxPopup — site-wide first-visit popup advertising Bloom Box subscriptions.
 *
 * Behaviour:
 * - Shows once per browser session (sessionStorage key "bbp_dismissed")
 * - 4 second delay after page load so the homepage is visible first
 * - Smooth fade-in (backdrop + card slide-up) on open
 * - Smooth fade-out (card slide-down) on dismiss before unmounting
 * - Dismiss via: X button, "No thanks" link, or clicking the backdrop
 * - Buy CTA routes to /harvest-stand
 * - Scarcity counter persists in localStorage and decrements on each visit
 * - Suppressed on florist auth/portal pages, admin, CSA, bouquet bar
 */
import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";

const BOUQUET_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/harvest-bouquet-FabX3efg5cBChbv7p9NVxd.webp";

const SUPPRESSED_PATHS = [
  "/florist-register",
  "/florist-login",
  "/florist-portal",
  "/florist-dashboard",
  "/florist-forgot-password",
  "/florist-reset-password",
  "/florist-portfolio",
  "/admin",
  "/diary-admin",
  "/csa",
  "/bouquet-bar",
  "/order-success",
];

export default function BloomBoxPopup() {
  // "mounted" controls whether the DOM node exists at all
  const [mounted, setMounted] = useState(false);
  // "visible" drives the CSS transition classes (fade-in vs fade-out)
  const [visible, setVisible] = useState(false);
  const [location] = useLocation();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSuppressed = SUPPRESSED_PATHS.some((p) => location.startsWith(p));

  useEffect(() => {
    if (isSuppressed) return;
    if (sessionStorage.getItem("bbp_dismissed")) return;

    const showTimer = setTimeout(() => {
      setMounted(true);
      // Small rAF delay so the element is in the DOM before we flip visible→true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, 4000);

    return () => clearTimeout(showTimer);
  }, [isSuppressed]);

  const dismiss = () => {
    sessionStorage.setItem("bbp_dismissed", "1");
    setVisible(false); // triggers fade-out CSS transition
    // Unmount after the transition completes (300ms)
    hideTimerRef.current = setTimeout(() => setMounted(false), 320);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!mounted || isSuppressed) return null;

  return (
    <>
      {/* Backdrop — fades in/out, click to dismiss */}
      <div
        onClick={dismiss}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          cursor: "pointer",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: visible ? "all" : "none",
        }}
      />

      {/* Modal wrapper — centres the card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bloom Box subscription offer"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        {/* Card — fades in + slides up, fades out + slides down */}
        <div
          style={{
            position: "relative",
            pointerEvents: "all",
            width: "100%",
            maxWidth: "480px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            background: "#1A1008",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
            transition: visible
              ? "opacity 0.45s ease, transform 0.45s ease"
              : "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* X button */}
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.4)",
              border: "none",
              color: "rgba(245,240,232,0.8)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#F5F0E8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,240,232,0.8)";
            }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>

          {/* Hero image */}
          <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
            <img
              src={BOUQUET_IMG}
              alt="Red Dirt Blooms bouquet"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #1A1008, transparent)" }} />
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "#B5451B",
                color: "#F5F0E8",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "3px 10px",
                borderRadius: "999px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Limited spots each season — first come, first served
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem 1.75rem 1.75rem" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B5451B", marginBottom: "0.5rem" }}>
              Now Available
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem, 4vw, 1.9rem)", color: "#F5F0E8", lineHeight: 1.2, marginBottom: "0.75rem", fontWeight: 600 }}>
              Fresh Oklahoma Flowers,{" "}
              <em style={{ color: "#D4A853" }}>Every Week.</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", color: "#8A7A6A", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Our Bloom Box subscriptions bring hand-cut, organically grown bouquets straight from our red-dirt fields to your door — cut morning-of, never cold-chained, never imported.
            </p>

            {/* Tier cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { name: "Weekly Bloom Share", weeks: "12 bouquets · June–Oct", price: "$396", badge: "Best Value" },
                { name: "Bi-Weekly Bloom Share", weeks: "6 bouquets · June–Oct", price: "$210", badge: "Flexible" },
              ].map((tier) => (
                <div key={tier.name} style={{ borderRadius: "10px", padding: "0.875rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700, background: "rgba(212,168,83,0.15)", color: "#D4A853", padding: "2px 8px", borderRadius: "999px", display: "inline-block", marginBottom: "0.4rem" }}>
                    {tier.badge}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#F5EFE6", fontWeight: 600, marginBottom: "0.2rem" }}>
                    {tier.name}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#6A5A4A" }}>
                    {tier.weeks} · <span style={{ color: "#D4A853" }}>{tier.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/harvest-stand" onClick={dismiss}>
              <button
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #B5451B 0%, #E8A020 100%)",
                  color: "#F5F0E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  boxShadow: "0 4px 20px rgba(181,69,27,0.35)",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              >
                Reserve My Bloom Box →
              </button>
            </Link>

            {/* No thanks */}
            <button
              onClick={dismiss}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                marginTop: "0.75rem",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.85rem",
                color: "rgba(245,240,232,0.55)",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(245,240,232,0.85)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(245,240,232,0.55)")}
            >
              No thanks, I'll browse on my own
            </button>

            {/* Bouquet Bar line */}
            <div style={{ textAlign: "center", marginTop: "0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(212,168,83,0.55)" }}>
              Planning something special? Ask about our{" "}
              <Link href="/bouquet-bar" onClick={dismiss} style={{ color: "rgba(212,168,83,0.75)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                Bouquet Bar
              </Link>
              !
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
