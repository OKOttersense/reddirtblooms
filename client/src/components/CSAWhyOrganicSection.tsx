/**
 * CSA Why Organic Matters Section
 * A rich feature section for the CSA landing page that explains the
 * organic growing philosophy, what "no chemicals" actually means,
 * and why Red Dirt Blooms flowers last longer and look better.
 * 
 * Positioned after the Harvest Calendar and before the Tier Selector.
 */

import { useEffect, useRef, useState } from "react";
import { Leaf, Droplets, Sun, Wind, Shield, Award } from "lucide-react";

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}
    >
      {children}
    </div>
  );
}

const PILLARS = [
  {
    icon: <Leaf className="w-6 h-6" />,
    color: "#5D8A5E",
    title: "No Synthetic Pesticides",
    body: "We use companion planting, beneficial insects, and hand-picking to manage pests. Your bouquet never touched a spray nozzle.",
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    color: "#4A7FA5",
    title: "Compost-Fed Soil",
    body: "Oklahoma red clay is amended every season with homemade compost and cover crops. Healthy soil grows flowers that last 10–14 days in the vase.",
  },
  {
    icon: <Sun className="w-6 h-6" />,
    color: "#D4A853",
    title: "Cut at Peak Bloom",
    body: "We cut at the exact stage of development — not a day early for shipping, not a day late. You get the full vase life, not what's left of it.",
  },
  {
    icon: <Wind className="w-6 h-6" />,
    color: "#B5451B",
    title: "Zero Air Miles",
    body: "Most grocery store flowers fly 3,000+ miles from South America. Ours travel 30 miles, maximum. That's why they smell like flowers.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    color: "#7A8C6E",
    title: "Safe for Kids & Pets",
    body: "No residual chemicals on the stems or petals. CSA members with young children and curious dogs tell us this matters more than anything.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    color: "#D4A853",
    title: "Oklahoma Grown, Period",
    body: "Every stem in your share was planted, tended, and cut right here in central Oklahoma. We know the name of every variety in your bouquet.",
  },
];

const STATS = [
  { value: "10–14", label: "Days average vase life", sub: "vs. 5–7 for imported flowers" },
  { value: "0", label: "Synthetic chemicals used", sub: "ever, on any crop" },
  { value: "30mi", label: "Maximum farm-to-door distance", sub: "for OKC metro members" },
  { value: "100%", label: "Oklahoma-grown guarantee", sub: "every stem, every week" },
];

export default function CSAWhyOrganicSection() {
  return (
    <section className="py-24 px-6" style={{ background: "#1A1008" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <FadeUp>
          <div className="text-center mb-16">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: "#5D8A5E" }}
            >
              The Red Dirt Difference
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#F5EFE6",
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              Why Organic Isn't Just a{" "}
              <em style={{ color: "#D4A853" }}>Label</em>
            </h2>
            <p
              className="mt-4 max-w-2xl mx-auto text-base leading-relaxed"
              style={{ color: "#6A5A4A" }}
            >
              The word "organic" gets thrown around a lot. Here's what it actually means on this farm — and why it makes your flowers look better, last longer, and smell like they're supposed to.
            </p>
          </div>
        </FadeUp>

        {/* Stats Bar */}
        <FadeUp delay={100}>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-16 rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="p-6 text-center"
                style={{ background: "#130C07" }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "#D4A853",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-semibold mt-2 mb-1" style={{ color: "#F5EFE6" }}>
                  {stat.label}
                </div>
                <div className="text-xs" style={{ color: "#6A5A4A" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Six Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {PILLARS.map((p, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div
                className="p-6 rounded-2xl h-full"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "border-color 0.3s ease, background 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${p.color}40`;
                  (e.currentTarget as HTMLDivElement).style.background = `${p.color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${p.color}20`, color: p.color }}
                >
                  {p.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-base"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F5EFE6", fontSize: "1.15rem" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6A5A4A" }}>
                  {p.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Pull Quote */}
        <FadeUp delay={200}>
          <div
            className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(93,138,94,0.12) 0%, rgba(212,168,83,0.08) 100%)",
              border: "1px solid rgba(93,138,94,0.2)",
            }}
          >
            {/* Decorative quote mark */}
            <div
              className="absolute top-4 left-8 select-none pointer-events-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "8rem",
                color: "rgba(93,138,94,0.08)",
                lineHeight: 1,
              }}
            >
              "
            </div>
            <blockquote
              className="relative z-10 max-w-2xl mx-auto"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                color: "#F5EFE6",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              I've been buying flowers for 20 years. I didn't know what a fresh flower actually smelled like until I got my first Red Dirt Blooms share.
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-8 h-px" style={{ background: "#D4A853" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#D4A853" }}>
                Sarah M. — Nichols Hills, OK
              </span>
              <div className="w-8 h-px" style={{ background: "#D4A853" }} />
            </div>
          </div>
        </FadeUp>

        {/* CTA nudge toward tiers */}
        <FadeUp delay={100}>
          <div className="mt-12 text-center">
            <p className="text-sm mb-4" style={{ color: "#6A5A4A" }}>
              Ready to taste the difference?
            </p>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 font-semibold px-8 py-3 rounded-full transition-all"
              style={{
                background: "#5D8A5E",
                color: "#F5EFE6",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#4a7050")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#5D8A5E")}
            >
              Choose Your Share
              <span style={{ fontSize: "1.1rem" }}>↓</span>
            </a>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
