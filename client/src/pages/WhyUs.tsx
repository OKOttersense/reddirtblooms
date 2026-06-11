/**
 * Red Dirt Blooms — Why Us / Competitor Comparison Page
 * 
 * A premium value-positioning page that compares Red Dirt Blooms against
 * local Oklahoma competitors and grocery store flowers. Uses the Prairie
 * Modern design system. Designed to convert skeptical premium buyers.
 * 
 * Route: /why-us
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Check,
  X,
  Minus,
  Leaf,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowRight,
  Flower2,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// ─── Fade-up animation helper ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type CellValue = true | false | null | string;

interface ComparisonRow {
  label: string;
  tooltip?: string;
  rdb: CellValue;
  local: CellValue;
  grocery: CellValue;
  highlight?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Grown in Oklahoma",
    rdb: true,
    local: "Some",
    grocery: false,
    highlight: true,
  },
  {
    label: "Certified organic / no synthetic chemicals",
    rdb: true,
    local: "Rarely",
    grocery: false,
    highlight: true,
  },
  {
    label: "Cut same morning as your pickup",
    rdb: true,
    local: "Usually",
    grocery: false,
    highlight: true,
  },
  {
    label: "Specialty cut flower varieties (ranunculus, lisianthus, peonies)",
    rdb: true,
    local: "Some",
    grocery: false,
  },
  {
    label: "10–14 day average vase life",
    rdb: true,
    local: "7–10 days",
    grocery: "3–5 days",
    highlight: true,
  },
  {
    label: "Handwritten care card with every bouquet",
    rdb: true,
    local: false,
    grocery: false,
  },
  {
    label: "Seasonal variety — no two bouquets alike",
    rdb: true,
    local: "Varies",
    grocery: false,
  },
  {
    label: "CSA / subscription share available",
    rdb: true,
    local: "Some",
    grocery: false,
  },
  {
    label: "Dried flower off-season products",
    rdb: true,
    local: false,
    grocery: false,
  },
  {
    label: "Farm events & member invitations",
    rdb: true,
    local: false,
    grocery: false,
  },
  {
    label: "Florist wholesale portal",
    rdb: true,
    local: false,
    grocery: false,
  },
  {
    label: "\"This Week's Blooms\" email preview",
    rdb: true,
    local: false,
    grocery: false,
  },
  {
    label: "Price per bouquet",
    rdb: "$35–$45",
    local: "$25–$30",
    grocery: "$10–$20",
  },
];

const LOCAL_COMPETITORS = [
  {
    name: "Doodles & Blooms",
    location: "Edmond, OK",
    price: "$25/bouquet",
    share: "5-week seasonal",
    note: "Entry-level, mass market positioning. No organic claim.",
    color: "#6A5A4A",
  },
  {
    name: "Blue House Urban Farm",
    location: "OKC / Paseo Arts",
    price: "$30/bouquet",
    share: "6-bouquet spring/summer",
    note: "Pesticide-free claim, May–July only. Closest competitor to premium.",
    color: "#4A7FA5",
  },
  {
    name: "Petal Pusher Farms",
    location: "OKC Area",
    price: "~$25/bouquet",
    share: "6-bouquet bi-weekly",
    note: "Farm/Flora Bodega pickup. Pricing not publicly listed.",
    color: "#7A8C6E",
  },
  {
    name: "MoonMtnFarm",
    location: "OKC",
    price: "~$25/bouquet",
    share: "4-week market bouquet",
    note: "Local pickup/delivery. Minimal online presence.",
    color: "#8A7A6A",
  },
];

const DIFFERENTIATORS = [
  {
    icon: <Leaf className="w-7 h-7" />,
    color: "#5D8A5E",
    title: "The Only Fully Organic Farm in the OKC Metro",
    body: "Blue House Urban Farm markets as pesticide-free. We go further: no synthetic fertilizers, no herbicides, no fungicides — ever. Our soil is alive because we've been feeding it for years.",
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    color: "#D4A853",
    title: "Specialty Varieties Nobody Else Grows",
    body: "Ranunculus, lisianthus, sweet peas, peonies, and dahlias require skill, patience, and the right microclimate. Most local farms stick to zinnias and sunflowers. We grow the flowers florists charge $8–$12 per stem for.",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    color: "#B5451B",
    title: "Cut Morning-of, Not Days Ago",
    body: "Grocery store flowers are cut 7–14 days before you buy them, then cold-stored and shipped across the continent. Our flowers are cut the morning of your pickup. That's why they last 10–14 days in your vase.",
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    color: "#7A8C6E",
    title: "30 Miles, Maximum",
    body: "The average grocery store bouquet travels 3,000+ miles from Colombia or Ecuador. Ours travels 30 miles. That's why they smell like flowers — because they still are.",
  },
  {
    icon: <Heart className="w-7 h-7" />,
    color: "#C0392B",
    title: "A Relationship, Not a Transaction",
    body: "CSA members get handwritten care cards, \"This Week's Blooms\" email previews, early shop access, and invitations to farm events. You know where your flowers come from. You know who grew them.",
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    color: "#4A7FA5",
    title: "Safe for Every Member of Your Household",
    body: "No pesticide residue on stems or petals. CSA members with young children, curious pets, and chemical sensitivities tell us this is the reason they joined — and the reason they renew.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I bought from Doodles & Blooms for two seasons. The flowers were fine. Red Dirt Blooms is something else entirely — they last twice as long and I actually know what I'm getting before pickup day.",
    name: "Jennifer R.",
    location: "Edmond, OK",
    tier: "Spring Harvest Share member",
  },
  {
    quote: "I used to spend $25 a week at Whole Foods on flowers that died in four days. Now I spend $40 once a week and they're still beautiful on day twelve. The math isn't even close.",
    name: "Marcus T.",
    location: "Nichols Hills, OK",
    tier: "Full Bloom Membership",
  },
  {
    quote: "As a florist, I've tried every local farm. Red Dirt Blooms is the only one growing lisianthus and ranunculus at a quality I can actually sell. My clients notice the difference.",
    name: "Danielle K.",
    location: "Midtown OKC",
    tier: "Wholesale florist partner",
  },
];

// ─── Cell Renderer ────────────────────────────────────────────────────────────
function Cell({ value, isRDB = false }: { value: CellValue; isRDB?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: isRDB ? "rgba(93,138,94,0.2)" : "rgba(255,255,255,0.05)" }}
        >
          <Check className="w-4 h-4" style={{ color: isRDB ? "#5D8A5E" : "#6A5A4A" }} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)" }}>
          <X className="w-4 h-4" style={{ color: "#3A2A1A" }} />
        </div>
      </div>
    );
  }
  if (value === null) {
    return (
      <div className="flex justify-center">
        <Minus className="w-4 h-4" style={{ color: "#4A3A2A" }} />
      </div>
    );
  }
  // String value
  return (
    <div
      className="text-center text-xs font-semibold px-2 py-1 rounded-full"
      style={{
        background: isRDB ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.04)",
        color: isRDB ? "#D4A853" : "#6A5A4A",
      }}
    >
      {value}
    </div>
  );
}

/// ─── FAQ Data ───────────────────────────────────────────────────────────────
const WHY_US_FAQS = [
  {
    q: "Why are Red Dirt Blooms flowers more expensive than the grocery store?",
    a: "Grocery store flowers are cut 7–14 days before you buy them, cold-stored, and shipped 3,000+ miles from South America. They're engineered for shelf life, not beauty or fragrance. Our flowers are cut the morning of your pickup, grown without synthetic chemicals, and selected for vase life and visual impact. You're paying for the actual flower — not the logistics chain around it.",
  },
  {
    q: "What does 'locally grown' actually mean for the quality of my flowers?",
    a: "It means everything. A flower cut this morning and driven 30 miles to you is biologically different from one cut two weeks ago and flown from Ecuador. Local flowers haven't been through ethylene gas treatment, cold-chain stress, or long-haul dehydration. They open fully, they smell the way flowers are supposed to smell, and they last 10–14 days in the vase — roughly twice as long as imported alternatives.",
  },
  {
    q: "How does Red Dirt Blooms compare to other local Oklahoma flower farms?",
    a: "We respect every farm growing flowers in Oklahoma. The key differences are: we are the only farm in the OKC metro with a fully organic growing practice (no synthetic pesticides, fertilizers, or herbicides); we grow specialty cut flower varieties — ranunculus, lisianthus, sweet peas, peonies — that most local farms don't attempt; and we offer a complete membership experience with handwritten care cards, weekly email previews, farm events, and a dried flower off-season product line. Our CSA shares price at $35–$45/bouquet vs. the local market average of $25–$30.",
  },
  {
    q: "Is the premium price worth it if I'm just buying flowers for my home?",
    a: "That's the right question to ask. Here's the math: a $20 grocery store bouquet that lasts 4 days costs you $5/day. A $45 Red Dirt Blooms bouquet that lasts 12 days costs you $3.75/day. The premium bouquet is actually cheaper per day of enjoyment — and it smells like a flower, not a refrigerator.",
  },
  {
    q: "What does 'organic' mean on a flower farm — aren't flowers just decorative?",
    a: "Organic matters for two reasons beyond decoration. First, conventional flower farms are among the heaviest pesticide users in agriculture — the residues stay on stems and petals. If you have children, pets, or chemical sensitivities in your home, that matters. Second, organic soil produces flowers with stronger cell walls, more vibrant color, and longer vase life. It's not a marketing claim — it's plant biology.",
  },
  {
    q: "Can I try Red Dirt Blooms before committing to a full CSA share?",
    a: "Yes. The Harvest Stand sells individual bouquets when inventory is available — no subscription required. The Prairie Sampler CSA tier (3 bouquets over 6 weeks, $135) is also designed as a low-commitment entry point for first-time members who want to experience the quality before committing to a full season.",
  },
  {
    q: "How do I know the flowers are actually grown in Oklahoma?",
    a: "We post weekly harvest updates in The Bloom Diary — photos and short videos from the field, showing exactly what's being cut and when. CSA members receive a 'This Week's Blooms' email every pickup week with the specific varieties in their share. You're welcome to visit the farm; member farm visits are offered each season.",
  },
];

// ─── FAQ Component ───────────────────────────────────────────────────────────
function WhyUsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="py-24 px-6" style={{ background: "#0F0A06" }}>
      <div className="max-w-3xl mx-auto">
        <FadeUp>
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "#B5451B" }}
            >
              Common Questions
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                color: "#F5EFE6",
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              Frequently Asked{" "}
              <em style={{ color: "#D4A853" }}>Questions</em>
            </h2>
            <p className="mt-4 text-sm" style={{ color: "#6A5A4A" }}>
              About the premium pricing, organic growing, and what makes locally grown flowers different.
            </p>
          </div>
        </FadeUp>
        <div className="space-y-3">
          {WHY_US_FAQS.map((faq, i) => (
            <FadeUp key={i} delay={i * 50}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: openIndex === i ? "rgba(212,168,83,0.06)" : "rgba(255,255,255,0.02)",
                  border: openIndex === i ? "1px solid rgba(212,168,83,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.3s, border-color 0.3s",
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span
                    className="font-semibold text-sm leading-snug"
                    style={{
                      color: openIndex === i ? "#D4A853" : "#F5EFE6",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.05rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: openIndex === i ? "rgba(212,168,83,0.2)" : "rgba(255,255,255,0.05)",
                      color: openIndex === i ? "#D4A853" : "#6A5A4A",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      transition: "background 0.2s, color 0.2s, transform 0.3s",
                      transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
                {openIndex === i && (
                  <div
                    className="px-6 pb-6 text-sm leading-relaxed"
                    style={{ color: "#8A7A6A" }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WhyUs() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0F0A06", color: "#F5EFE6", fontFamily: "'DM Sans', sans-serif" }}
    >
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-6 text-center overflow-hidden"
        style={{ background: "linear-gradient(to bottom, #130C07, #0F0A06)" }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(181,69,27,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
              style={{ background: "rgba(181,69,27,0.15)", border: "1px solid rgba(181,69,27,0.3)", color: "#E8A87C" }}
            >
              <Flower2 className="w-3.5 h-3.5" />
              The Red Dirt Difference
            </div>
          </FadeUp>
          <FadeUp delay={80}>
            <h1
              className="mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                lineHeight: 1.05,
                fontWeight: 600,
                color: "#F5EFE6",
              }}
            >
              Why Red Dirt Blooms{" "}
              <br />
              <em style={{ color: "#D4A853" }}>Isn't a Comparison</em>
            </h1>
          </FadeUp>
          <FadeUp delay={150}>
            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#6A5A4A" }}
            >
              There are other flower farms in Oklahoma. There are grocery store bouquets. And then there is what we do. This page exists because we think you deserve to know exactly what you're choosing — and why it matters.
            </p>
          </FadeUp>
          <FadeUp delay={220}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/csa"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all"
                style={{ background: "#B5451B", color: "#F5EFE6" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B3214")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#B5451B")}
              >
                Reserve a CSA Share
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#comparison"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#F5EFE6", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)")}
              >
                See the Full Comparison
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Price Context Bar ─────────────────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "#130C07", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <p className="text-center text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "#5D8A5E" }}>
              Oklahoma CSA Flower Share — Pricing at a Glance
            </p>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Grocery Store", price: "$10–$20", per: "per bouquet", note: "Shipped from Colombia", bar: 22, color: "#3A2A1A" },
              { name: "Local Competitors", price: "$25–$30", per: "per bouquet", note: "Avg. Oklahoma farm CSA", bar: 55, color: "#6A5A4A" },
              { name: "Red Dirt Blooms", price: "$35–$45", per: "per bouquet", note: "Premium organic, local", bar: 100, color: "#D4A853", highlight: true },
              { name: "National Premium", price: "$40–$60", per: "per bouquet", note: "Hudson Valley, Bainbridge", bar: 88, color: "#5D8A5E" },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 70}>
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: item.highlight ? "rgba(212,168,83,0.08)" : "rgba(255,255,255,0.02)",
                    border: item.highlight ? "1px solid rgba(212,168,83,0.25)" : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="text-xs font-semibold mb-3" style={{ color: item.highlight ? "#D4A853" : "#6A5A4A" }}>
                    {item.name}
                    {item.highlight && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,168,83,0.2)", color: "#D4A853" }}>
                        You're here
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: item.highlight ? "#D4A853" : "#F5EFE6",
                      lineHeight: 1,
                    }}
                  >
                    {item.price}
                  </div>
                  <div className="text-xs mt-1 mb-3" style={{ color: "#4A3A2A" }}>
                    {item.per}
                  </div>
                  {/* Bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.bar}%`, background: item.color, transition: "width 1s ease" }}
                    />
                  </div>
                  <div className="text-xs mt-2" style={{ color: "#4A3A2A" }}>
                    {item.note}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Six Differentiators ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#0F0A06" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#B5451B" }}>
                What Sets Us Apart
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
                Six Reasons the Price{" "}
                <em style={{ color: "#D4A853" }}>Makes Sense</em>
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((d, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div
                  className="p-7 rounded-2xl h-full"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "border-color 0.3s, background 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${d.color}40`;
                    (e.currentTarget as HTMLDivElement).style.background = `${d.color}08`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${d.color}20`, color: d.color }}
                  >
                    {d.icon}
                  </div>
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#F5EFE6",
                      lineHeight: 1.3,
                    }}
                  >
                    {d.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6A5A4A" }}>
                    {d.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Comparison Table ─────────────────────────────────────────────── */}
      <section id="comparison" className="py-24 px-6" style={{ background: "#130C07" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#5D8A5E" }}>
                Side-by-Side
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
                Red Dirt Blooms vs.{" "}
                <em style={{ color: "#D4A853" }}>Everyone Else</em>
              </h2>
              <p className="mt-4 text-sm" style={{ color: "#6A5A4A" }}>
                "Local Competitors" represents the average of Doodles & Blooms, Blue House Urban Farm, and Petal Pusher Farms.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Table header */}
              <div
                className="grid grid-cols-4 gap-0"
                style={{ background: "#1A1008", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="p-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#4A3A2A" }}>
                  Feature
                </div>
                {/* RDB column header — highlighted */}
                <div
                  className="p-5 text-center"
                  style={{ background: "rgba(181,69,27,0.12)", borderLeft: "1px solid rgba(181,69,27,0.2)", borderRight: "1px solid rgba(181,69,27,0.2)" }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Flower2 className="w-4 h-4" style={{ color: "#D4A853" }} />
                    <span className="text-sm font-bold" style={{ color: "#D4A853" }}>Red Dirt Blooms</span>
                  </div>
                  <div className="text-xs" style={{ color: "#8A6A4A" }}>Oklahoma-grown, organic</div>
                </div>
                <div className="p-5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#F5EFE6" }}>Local Competitors</div>
                  <div className="text-xs" style={{ color: "#4A3A2A" }}>Doodles & Blooms, Blue House, etc.</div>
                </div>
                <div className="p-5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#F5EFE6" }}>Grocery Store</div>
                  <div className="text-xs" style={{ color: "#4A3A2A" }}>Whole Foods, Trader Joe's, etc.</div>
                </div>
              </div>

              {/* Table rows */}
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-0"
                  style={{
                    background: row.highlight
                      ? "rgba(212,168,83,0.03)"
                      : i % 2 === 0
                      ? "rgba(255,255,255,0.01)"
                      : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="p-4 flex items-center">
                    <span className="text-sm" style={{ color: row.highlight ? "#F5EFE6" : "#6A5A4A" }}>
                      {row.label}
                    </span>
                  </div>
                  <div
                    className="p-4 flex items-center justify-center"
                    style={{
                      background: "rgba(181,69,27,0.06)",
                      borderLeft: "1px solid rgba(181,69,27,0.15)",
                      borderRight: "1px solid rgba(181,69,27,0.15)",
                    }}
                  >
                    <Cell value={row.rdb} isRDB />
                  </div>
                  <div className="p-4 flex items-center justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.03)" }}>
                    <Cell value={row.local} />
                  </div>
                  <div className="p-4 flex items-center justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.03)" }}>
                    <Cell value={row.grocery} />
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Local Competitor Cards ────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#0F0A06" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#B5451B" }}>
                Know Your Options
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
                The Oklahoma Flower Farm{" "}
                <em style={{ color: "#D4A853" }}>Landscape</em>
              </h2>
              <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: "#6A5A4A" }}>
                We respect every local farm growing flowers in Oklahoma. Here's an honest look at what each offers — and where the gap is.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {LOCAL_COMPETITORS.map((c, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: "#F5EFE6" }}>{c.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" style={{ color: c.color }} />
                        <span className="text-xs" style={{ color: c.color }}>{c.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: "#F5EFE6" }}>{c.price}</div>
                      <div className="text-xs" style={{ color: "#4A3A2A" }}>{c.share}</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A" }}>{c.note}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* RDB summary card */}
          <FadeUp delay={150}>
            <div
              className="p-8 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(181,69,27,0.15) 0%, rgba(212,168,83,0.08) 100%)",
                border: "1px solid rgba(181,69,27,0.3)",
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(181,69,27,0.2)" }}
                >
                  <Flower2 className="w-7 h-7" style={{ color: "#D4A853" }} />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#F5EFE6",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Red Dirt Blooms — The Premium Tier
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6A5A4A" }}>
                    $35–$45/bouquet · Fully organic · Specialty varieties · Cut morning-of · Handwritten care cards · CSA + wholesale + dried flowers. The only Oklahoma farm occupying the premium position — and the only one with a waitlist.
                  </p>
                </div>
                <Link
                  href="/csa"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all"
                  style={{ background: "#B5451B", color: "#F5EFE6" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B3214")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#B5451B")}
                >
                  Join the CSA
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#130C07" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#5D8A5E" }}>
                From Members Who Switched
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
                They Tried the Others.{" "}
                <em style={{ color: "#D4A853" }}>They Stayed.</em>
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={i} delay={i * 90}>
                <div
                  className="p-7 rounded-2xl h-full flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: "#D4A853" }} />
                    ))}
                  </div>
                  <blockquote
                    className="flex-1 text-sm leading-relaxed mb-6"
                    style={{ color: "#8A7A6A", fontStyle: "italic" }}
                  >
                    "{t.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#F5EFE6" }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#5D8A5E" }}>{t.location}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#4A3A2A" }}>{t.tier}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
      {/* ── FAQ ────────────────────────────────────────────────────────────────────────────────────────── */}
      <WhyUsFAQ />
      {/* ── Final CTA ─────────────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{
          background: "linear-gradient(to bottom, #130C07, #0F0A06)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#F5EFE6",
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              Ready to Taste the{" "}
              <em style={{ color: "#D4A853" }}>Difference?</em>
            </h2>
            <p className="text-base mb-10" style={{ color: "#6A5A4A" }}>
              Only 30 CSA shares available per season. Seven spots remain for 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/csa"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-base transition-all"
                style={{ background: "#B5451B", color: "#F5EFE6" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#8B3214")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#B5451B")}
              >
                Reserve Your Share
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/harvest-stand"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-base transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#F5EFE6", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
              >
                Shop Individual Bouquets
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
