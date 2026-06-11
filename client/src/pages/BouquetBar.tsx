import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, Heart, Sparkles, Calendar, Users, Gift,
  Star, ChevronDown, ChevronUp, ArrowRight, Flower2, Leaf, MapPin, CalendarDays,
  Loader2, CheckCircle2, Mail, Phone, CalendarCheck
} from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// ─── Assets ───────────────────────────────────────────────────────────────────
const HERO_IMG = "/manus-storage/bouquet-bar-event_eacc5ee3.jpg";
const ARRANGEMENT_IMG = "/manus-storage/bouquet-arrangement_69c0b5f3.jpg";
const BUCKETS_IMG = "/manus-storage/bouquet-buckets-event_5fbca7ad.png";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#120A06",
  bgCard:   "rgba(255,255,255,0.04)",
  bgCardHi: "rgba(212,168,83,0.12)",
  border:   "rgba(255,255,255,0.08)",
  borderGold: "rgba(212,168,83,0.35)",
  cream:    "#F5EDD6",
  creamFade: "rgba(245,237,214,0.65)",
  creamDim:  "rgba(245,237,214,0.4)",
  gold:     "#D4A853",
  goldFade: "rgba(212,168,83,0.55)",
  rust:     "#C0392B",
  gradCTA:  "linear-gradient(135deg, #C0392B 0%, #D4A853 100%)",
};

// ─── Event Types ──────────────────────────────────────────────────────────────
const EVENTS = [
  { id: "birthday",      emoji: "🎂", label: "Birthday",      desc: "Make their day unforgettable",      color: "#E8A87C" },
  { id: "anniversary",   emoji: "💍", label: "Anniversary",   desc: "Celebrate love in full bloom",       color: "#D4A853" },
  { id: "engagement",    emoji: "💐", label: "Engagement",    desc: "The beginning of forever",           color: "#C0392B" },
  { id: "baby-shower",   emoji: "🌸", label: "Baby Shower",   desc: "Welcome the newest bloom",           color: "#B8A9C9" },
  { id: "bridal-shower", emoji: "👰", label: "Bridal Shower", desc: "Shower her with petals",             color: "#E8C4B8" },
  { id: "other",         emoji: "✨", label: "Other",         desc: "Any reason to celebrate",            color: "#8BAF7C" },
];

// ─── Pricing tiers ────────────────────────────────────────────────────────────
const PRICING = [
  {
    name: "Single Bouquet",
    range: "$45 – $85",
    desc: "One stunning hand-wrapped bouquet, cut morning-of. Perfect for birthdays, thank-yous, or just because.",
    includes: ["1 hand-wrapped bouquet", "Seasonal variety mix", "Care card included", "Farm pickup or delivery"],
    icon: <Flower2 className="w-5 h-5" />,
  },
  {
    name: "Celebration Set",
    range: "$150 – $300",
    desc: "Three to six arrangements for a table, mantle, or gift display. Coordinated palette, one delivery.",
    includes: ["3–6 arrangements", "Coordinated color palette", "Variety & texture mix", "Delivery included"],
    icon: <Heart className="w-5 h-5" />,
    featured: true,
  },
  {
    name: "Full Event",
    range: "$300 – $500+",
    desc: "Complete floral coverage for your event. We design to your vision, your venue, your moment.",
    includes: ["Custom arrangement count", "Venue-matched palette", "Setup coordination", "Delivery + placement"],
    icon: <Sparkles className="w-5 h-5" />,
  },
];

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell Us Your Vision",
    desc: "Fill out the inquiry form. The more you share — colors, vibe, venue — the better we can match your moment.",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    step: "02",
    title: "We Design Your Blooms",
    desc: "Within 48 hours, we'll send a custom proposal with variety suggestions, sizing, and pricing.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    step: "03",
    title: "Cut Fresh for Your Day",
    desc: "Your bouquets are cut the morning of your event. No cold chain, no imported stems — just Oklahoma flowers at peak bloom.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    step: "04",
    title: "Pickup or Delivery",
    desc: "Collect at the farm or choose local delivery to OKC, Edmond, Norman, and surrounding areas.",
    icon: <MapPin className="w-5 h-5" />,
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Sarah M.",
    event: "Birthday",
    quote: "I ordered a Bouquet Bar arrangement for my mom's 60th birthday. She cried. The flowers were still fresh five days later. Nothing from a grocery store has ever done that.",
    stars: 5,
  },
  {
    name: "Jenna & Cole",
    event: "Engagement",
    quote: "We wanted something that felt like Oklahoma — wildflowers, warm colors, a little untamed. Red Dirt Blooms nailed it. Our guests kept asking where the flowers came from.",
    stars: 5,
  },
  {
    name: "The Hendersons",
    event: "Baby Shower",
    quote: "Soft peach zinnias, blush lisianthus, the tiniest dahlias I've ever seen. It was exactly the vibe we wanted and it smelled incredible. Worth every penny.",
    stars: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How far in advance should I inquire?",
    a: "For most events, 2–3 weeks is ideal. For larger gatherings (10+ arrangements) or peak season dates (June–August), 4–6 weeks gives us the best chance to grow or source exactly what you're envisioning.",
  },
  {
    q: "What's the minimum order?",
    a: "Our minimum for Bouquet Bar orders is $75. Most single-event bouquets run $45–$85; table arrangements start at $65. We'll give you an exact quote based on your vision.",
  },
  {
    q: "Do you do weddings?",
    a: "We specialize in intimate events and celebrations — birthdays, showers, anniversaries, engagements. For full wedding florals (ceremony + reception), we partner with select local florists and can make an introduction.",
  },
  {
    q: "Can I pick the specific flowers?",
    a: "You can absolutely share preferences — colors, textures, specific varieties you love. We'll do our best to match them to what's at peak bloom on your event date. We never promise specific stems, but we always promise stunning.",
  },
  {
    q: "Do you deliver?",
    a: "Yes — local delivery to OKC, Edmond, Nichols Hills, Midtown, Norman, and surrounding areas. Delivery fee is $12–$25 depending on distance. Farm pickup is always free.",
  },
];

const BUDGETS = ["Under $75", "$75 – $150", "$150 – $300", "$300 – $500", "$500+", "Not sure yet"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: "rgba(212,168,83,0.18)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="font-medium text-sm md:text-base leading-snug" style={{ color: C.cream }}>{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: C.gold }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.gold }} />
        }
      </div>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: C.creamFade }}>{a}</p>
      )}
    </div>
  );
}

interface FormState {
  name: string; email: string; phone: string;
  eventType: string; eventDate: Date | undefined; guestCount: string;
  budget: string; vision: string;
}
const EMPTY: FormState = { name: "", email: "", phone: "", eventType: "", eventDate: undefined, guestCount: "", budget: "", vision: "" };

// ─── Main Component ───────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  email?: string;
  eventDate?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function BouquetBar() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string; eventType: string; eventDate: Date | undefined } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const notify = trpc.system.notifyOwner.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error("Something went wrong. Please try again or email us at hello@reddirtblooms.ai"),
  });

  const validate = (f: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (!f.name.trim()) errs.name = "Your name is required.";
    if (!f.email.trim()) errs.email = "Your email is required.";
    else if (!validateEmail(f.email)) errs.email = "Please enter a valid email address.";
    if (!f.eventDate) errs.eventDate = "Please select your event date.";
    return errs;
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, eventDate: true });
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }
    setSubmittedData({ name: form.name, email: form.email, eventType: form.eventType, eventDate: form.eventDate });
    notify.mutate({
      title: `🌸 Bouquet Bar Inquiry — ${form.eventType} — ${form.name}`,
      content: `**New Bouquet Bar Inquiry**\n\n**Name:** ${form.name}\n**Email:** ${form.email}\n**Phone:** ${form.phone || "Not provided"}\n**Event Type:** ${form.eventType}\n**Event Date:** ${form.eventDate ? format(form.eventDate, "MMMM d, yyyy") : "Not specified"}\n**Guest Count:** ${form.guestCount || "Not specified"}\n**Budget:** ${form.budget || "Not specified"}\n\n**Vision:**\n${form.vision || "Not provided"}`,
    });
  };

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div style={{ backgroundColor: C.bg, color: C.cream, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>

      {/* ── Minimal Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: `linear-gradient(to bottom, ${C.bg}F5, transparent)` }}>
        <Link href="/" className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: C.creamDim }}>
          <ArrowLeft className="w-4 h-4" />
          Back to Red Dirt Blooms
        </Link>
        <div className="text-xs tracking-widest uppercase" style={{ color: C.gold }}>
          Bouquet Bar
        </div>
      </nav>

      {/* ── Hero — full-bleed asymmetric ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
        <img
          src={HERO_IMG}
          alt="Bouquet Bar event flowers"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.38)" }}
        />
        {/* Layered gradient: bottom fade + left vignette */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${C.bg} 18%, transparent 65%), linear-gradient(to right, ${C.bg}CC 0%, transparent 55%)` }} />

        {/* Content — left-aligned, vertically centered */}
        <div className="relative z-10 flex flex-col justify-end h-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs tracking-widest uppercase"
              style={{ background: "rgba(212,168,83,0.12)", color: C.gold, border: `1px solid ${C.borderGold}` }}>
              <Gift className="w-3 h-3" />
              Special Events &amp; Celebrations
            </div>

            {/* Headline */}
            <h1 className="font-bold mb-5 leading-[1.1]"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: C.cream }}>
              Flowers That Make<br />
              <em style={{ color: C.gold }}>the Moment</em>
            </h1>

            {/* Sub */}
            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: C.creamFade }}>
              Hand-cut from our Oklahoma farm the morning of your event. Birthdays, anniversaries, engagements, baby showers — any reason to celebrate deserves flowers that were alive this morning.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-wrap gap-3">
              <a href="#inquiry"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: C.gradCTA, color: "#fff", boxShadow: "0 8px 28px rgba(192,57,43,0.35)" }}>
                Start Your Inquiry <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ border: `1px solid ${C.borderGold}`, color: C.gold }}>
                See Pricing
              </a>
            </div>
          </div>
        </div>

        {/* Floating stat strip */}
        <div className="absolute bottom-0 right-0 hidden md:flex flex-col gap-4 p-8 text-right">
          {[
            { num: "12–14", label: "day vase life" },
            { num: "48hr", label: "response time" },
            { num: "100%", label: "Oklahoma grown" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: C.gold }}>{s.num}</div>
              <div className="text-xs uppercase tracking-widest" style={{ color: C.creamDim }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── "Planning something special?" callout strip ── */}
      <section style={{ background: `linear-gradient(135deg, rgba(192,57,43,0.18) 0%, rgba(212,168,83,0.12) 100%)`, borderTop: `1px solid ${C.borderGold}`, borderBottom: `1px solid ${C.borderGold}` }}>
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xl md:text-2xl font-semibold text-center md:text-left"
            style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
            Planning something special?{" "}
            <span style={{ color: C.gold }}>Ask about our </span>
            <a href="#inquiry"
              className="underline underline-offset-4 decoration-dotted transition-opacity hover:opacity-80"
              style={{ color: C.gold, textDecorationColor: C.gold }}>
              Bouquet Bar
            </a>
            <span style={{ color: C.gold }}>!</span>
          </p>
          <a href="#inquiry"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: C.gradCTA, color: "#fff" }}>
            Get a Custom Quote <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Event Type Selector ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>What Are We Celebrating?</div>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Every Occasion Deserves<br />
              <em style={{ color: C.gold }}>Its Own Palette</em>
            </h2>
            <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: C.creamDim }}>
              Select your occasion below — we'll tailor variety suggestions and color palette to match the mood.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EVENTS.map((ev) => {
              const active = form.eventType === ev.label;
              return (
                <button
                  key={ev.id}
                  onClick={() => setForm((f) => ({ ...f, eventType: ev.label }))}
                  className="rounded-2xl p-6 text-left transition-all duration-200 group"
                  style={{
                    background: active ? `${ev.color}18` : C.bgCard,
                    border: active ? `1px solid ${ev.color}60` : `1px solid ${C.border}`,
                    transform: active ? "translateY(-3px)" : "none",
                    boxShadow: active ? `0 12px 32px ${ev.color}20` : "none",
                  }}
                >
                  <div className="text-3xl mb-3">{ev.emoji}</div>
                  <div className="font-semibold text-sm mb-1"
                    style={{ color: active ? ev.color : C.cream }}>
                    {ev.label}
                  </div>
                  <div className="text-xs leading-snug" style={{ color: C.creamDim }}>{ev.desc}</div>
                  {active && (
                    <div className="mt-3 text-xs font-medium" style={{ color: ev.color }}>
                      ✓ Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Photo + Why Local strip ── */}
      <section className="py-4 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: "280px" }}>
            <img src={ARRANGEMENT_IMG} alt="Flower arrangement" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,10,6,0.7) 0%, transparent 50%)" }} />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: C.goldFade }}>Cut to Order</div>
              <p className="text-sm font-medium" style={{ color: C.cream }}>Every stem cut the morning of your event</p>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: "280px" }}>
            <img src={BUCKETS_IMG} alt="Bouquet buckets at event" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,10,6,0.7) 0%, transparent 50%)" }} />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: C.goldFade }}>Oklahoma Grown</div>
              <p className="text-sm font-medium" style={{ color: C.cream }}>Organic, pesticide-free, OKC Metro farm</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>Transparent Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              What Does a Bouquet Bar Cost?
            </h2>
            <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: C.creamDim }}>
              Every order is custom — these ranges give you a starting point. We'll send an exact quote within 48 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((tier) => (
              <div key={tier.name}
                className="rounded-2xl p-7 flex flex-col"
                style={{
                  background: tier.featured ? C.bgCardHi : C.bgCard,
                  border: tier.featured ? `1px solid ${C.borderGold}` : `1px solid ${C.border}`,
                  boxShadow: tier.featured ? "0 16px 48px rgba(212,168,83,0.1)" : "none",
                }}>
                {tier.featured && (
                  <div className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: C.gold }}>
                    Most Popular
                  </div>
                )}
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(212,168,83,0.15)", color: C.gold }}>
                  {tier.icon}
                </div>
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                  {tier.name}
                </h3>
                <div className="text-2xl font-bold mb-3" style={{ color: C.gold, fontFamily: "'Playfair Display', serif" }}>
                  {tier.range}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: C.creamFade }}>{tier.desc}</p>
                <ul className="space-y-2 mt-auto">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: C.creamFade }}>
                      <span style={{ color: C.gold }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: C.creamDim }}>
            All pricing is custom-quoted. Ranges above are starting estimates. Delivery adds $12–$25 depending on distance.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6" style={{ background: "rgba(255,255,255,0.025)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>The Process</div>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              How the Bouquet Bar Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step}
                className="rounded-2xl p-7 flex gap-5"
                style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(212,168,83,0.12)", color: C.gold, border: `1px solid ${C.borderGold}` }}>
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: C.cream }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.creamFade }}>{step.desc}</p>
                </div>
                {/* Connector arrow (not on last) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:flex items-center absolute right-0 top-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>From Our Customers</div>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              What People Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="rounded-2xl p-7 flex flex-col"
                style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: C.gold }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic mb-5 flex-1" style={{ color: C.creamFade }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(212,168,83,0.2)", color: C.gold }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: C.cream }}>{t.name}</div>
                    <div className="text-xs" style={{ color: C.creamDim }}>{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry Form ── */}
      <section id="inquiry" className="py-20 px-6" style={{ background: "rgba(255,255,255,0.025)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>Get a Custom Quote</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Tell Us About Your Event
            </h2>
            <p className="text-sm" style={{ color: C.creamDim }}>
              We'll respond within 48 hours with a custom proposal. No commitment required.
            </p>
          </div>

          {submitted ? (
            <div className="py-8">
              {/* Success header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(192,57,43,0.2) 0%, rgba(212,168,83,0.2) 100%)", border: `2px solid ${C.borderGold}` }}>
                  <CheckCircle2 className="w-9 h-9" style={{ color: C.gold }} />
                </div>
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: C.goldFade }}>Inquiry Received</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                  We'll be in touch, {submittedData?.name.split(" ")[0] || "friend"}!
                </h3>
                <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: C.creamFade }}>
                  Your inquiry for a {submittedData?.eventType?.toLowerCase() || "special event"}{submittedData?.eventDate ? ` on ${format(submittedData.eventDate, "MMMM d, yyyy")}` : ""} has landed in our inbox. Expect a personal reply within 48 hours.
                </p>
              </div>
              {/* What happens next */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(212,168,83,0.06)", border: `1px solid ${C.borderGold}` }}>
                <p className="text-xs tracking-widest uppercase mb-4" style={{ color: C.goldFade }}>What Happens Next</p>
                <div className="space-y-4">
                  {[
                    { icon: <Mail className="w-4 h-4" style={{ color: C.gold }} />, step: "1", text: `We'll email ${submittedData?.email || "you"} within 48 hours with availability and a custom quote.` },
                    { icon: <Phone className="w-4 h-4" style={{ color: C.gold }} />, step: "2", text: "A quick 10-minute call to nail down your vision — colors, stems, vibe." },
                    { icon: <CalendarCheck className="w-4 h-4" style={{ color: C.gold }} />, step: "3", text: "We reserve your date and start planning your blooms. Cut morning-of, delivered fresh." },
                  ].map(({ icon, step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(212,168,83,0.15)", color: C.gold }}>{step}</div>
                      <div className="flex items-start gap-2 pt-0.5">
                        {icon}
                        <p className="text-sm leading-relaxed" style={{ color: C.creamFade }}>{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative flower strip */}
              <div className="flex items-center justify-center gap-3 text-2xl mb-6 opacity-60">🌸 🌼 🌺 🌻 🌷</div>
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setForm(EMPTY); setSubmitted(false); setSubmittedData(null); setErrors({}); setTouched({}); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ border: `1px solid ${C.borderGold}`, color: C.gold }}>
                  Submit Another Inquiry
                </button>
                <Link href="/csa"
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-center transition-opacity hover:opacity-80"
                  style={{ background: C.gradCTA, color: "#fff" }}>
                  Explore Bloom Shares →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Your Name *", field: "name" as const, type: "text", placeholder: "First & last name" },
                  { label: "Email *", field: "email" as const, type: "email", placeholder: "you@example.com" },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>{label}</label>
                    <input
                      type={type} value={form[field]} onChange={(e) => { set(field)(e); if (touched[field]) setErrors(validate({ ...form, [field]: e.target.value })); }} onBlur={() => handleBlur(field as keyof FormErrors)} placeholder={placeholder}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${touched[field] && errors[field as keyof FormErrors] ? "#e05c5c" : C.border}`,
                        color: C.cream
                      }}
                    />
                    {touched[field] && errors[field as keyof FormErrors] && (
                      <p className="mt-1 text-xs" style={{ color: "#e05c5c" }}>⚠ {errors[field as keyof FormErrors]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone + Event Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="(405) 555-0100"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.cream }} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Event Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none flex items-center justify-between gap-2 text-left"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: `1px solid ${touched["eventDate"] && errors.eventDate ? "#e05c5c" : C.border}`,
                          color: form.eventDate ? C.cream : C.creamDim,
                        }}
                      >
                        <span>{form.eventDate ? format(form.eventDate, "MMMM d, yyyy") : "Select a date"}</span>
                        <CalendarDays size={15} style={{ color: C.gold, flexShrink: 0 }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-0 shadow-2xl"
                      style={{ background: "#2a1f14", border: `1px solid ${C.border}` }}
                      align="start"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={form.eventDate}
                        onSelect={(date) => {
                          setForm((f) => ({ ...f, eventDate: date }));
                          setTouched((t) => ({ ...t, eventDate: true }));
                          setErrors((prev) => ({ ...prev, eventDate: date ? undefined : "Please select your event date." }));
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="rounded-xl"
                        style={{ color: C.cream }}
                      />
                    </PopoverContent>
                  </Popover>
                  {touched["eventDate"] && errors.eventDate && (
                    <p className="mt-1 text-xs" style={{ color: "#e05c5c" }}>⚠ {errors.eventDate}</p>
                  )}
                </div>
              </div>

              {/* Event Type dropdown */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Event Type *</label>
                <div className="relative">
                  <select
                    value={form.eventType}
                    onChange={set("eventType")}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none pr-10"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: form.eventType ? C.cream : C.creamDim }}
                  >
                    <option value="" style={{ background: "#1A0F0A" }}>Select event type…</option>
                    {EVENTS.map((ev) => (
                      <option key={ev.id} value={ev.label} style={{ background: "#1A0F0A" }}>{ev.emoji} {ev.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.gold }} />
                </div>
              </div>

              {/* Guest Count + Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Guest Count (approx.)</label>
                  <input type="text" value={form.guestCount} onChange={set("guestCount")} placeholder="e.g. 20 guests"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.cream }} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Budget Range</label>
                  <select value={form.budget} onChange={set("budget")}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "#1A0F0A", border: `1px solid ${C.border}`, color: form.budget ? C.cream : C.creamDim }}>
                    <option value="" style={{ background: "#1A0F0A" }}>Select a range</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b} style={{ background: "#1A0F0A" }}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vision */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>Tell Us Your Vision</label>
                <textarea value={form.vision} onChange={set("vision")} rows={5}
                  placeholder="Colors you love, flowers you've seen, the vibe you're going for — anything helps us design something perfect for you."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.cream }} />
              </div>

              {/* Submit */}
              <button type="submit" disabled={notify.isPending}
                className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: C.gradCTA, color: "#fff", boxShadow: "0 8px 32px rgba(192,57,43,0.3)" }}>
                {notify.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending your inquiry…</span>
                  </>
                ) : (
                  <span>Send My Inquiry →</span>
                )}
              </button>

              <p className="text-center text-xs" style={{ color: C.creamDim }}>
                We respond within 48 hours. No commitment required.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest uppercase mb-3" style={{ color: C.goldFade }}>Common Questions</div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Good to Know
            </h2>
          </div>
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Footer nudge ── */}
      <section className="py-16 px-6 text-center"
        style={{ background: `linear-gradient(135deg, rgba(192,57,43,0.08) 0%, rgba(212,168,83,0.06) 100%)`, borderTop: `1px solid ${C.borderGold}` }}>
        <div className="max-w-lg mx-auto">
          <div className="text-2xl mb-3">🌾</div>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Looking for flowers all season long?
          </h3>
          <p className="text-sm mb-6" style={{ color: C.creamFade }}>
            Join our weekly or bi-weekly Bloom Share — fresh Oklahoma flowers from June through October.
          </p>
          <Link href="/csa"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${C.borderGold}`, color: C.gold }}>
            Explore Bloom Share Subscriptions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
