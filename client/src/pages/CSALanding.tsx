import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import CSAMemberSection from "@/components/CSAMemberSection";
import CSAWhyOrganicSection from "@/components/CSAWhyOrganicSection";
import SampleWeekDemo from "@/components/SampleWeekDemo";
import {
  Leaf,
  Sun,
  Snowflake,
  CheckCircle2,
  Star,
  ArrowRight,
  MapPin,
  Calendar,
  Package,
  Truck,
  ChevronDown,
  ChevronUp,
  Flower2,
  Gift,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tier = "weekly" | "biweekly";
type Addon = "delivery" | "dried";

interface TierConfig {
  id: Tier;
  name: string;
  subtitle: string;
  weeks: number;
  bouquets: number;
  frequency: string;
  price: number;
  perBouquet: number;
  retailValue: number;
  savings: number;
  badge?: string;
  color: string;
  accent: string;
  icon: React.ReactNode;
  features: string[];
}

// ─── Tier Data ────────────────────────────────────────────────────────────────
const TIERS: TierConfig[] = [
  {
    id: "weekly",
    name: "Weekly Bloom Share",
    subtitle: "12 bouquets across the full bloom season — June through October",
    weeks: 20,
    bouquets: 12,
    frequency: "Weekly (weather-permitting)",
    price: 396,
    perBouquet: 33,
    retailValue: 504,
    savings: 108,
    badge: "Best Value",
    color: "from-red-900/50 to-red-800/30",
    accent: "#C0392B",
    icon: <Sun className="w-6 h-6" />,
    features: [
      "12 hand-cut premium bouquets — all 12 guaranteed",
      "Season window: June through October",
      "Intended weekly cadence — total count always honored",
      "Largest designer bouquets (15–24 stems)",
      "Handwritten care card with each share",
      "Priority member fulfillment window",
      "\"This Week's Blooms\" email preview every week",
      "Complimentary dried flower arrangement at season end ($45 value)",
      "Exclusive invitation to farm events",
      "First renewal offer for next season",
    ],
  },
  {
    id: "biweekly",
    name: "Bi-Weekly Bloom Share",
    subtitle: "6 bouquets across the full bloom season — June through October",
    weeks: 20,
    bouquets: 6,
    frequency: "Bi-Weekly (weather-permitting)",
    price: 210,
    perBouquet: 35,
    retailValue: 252,
    savings: 42,
    color: "from-amber-900/40 to-amber-800/20",
    accent: "#D4A853",
    icon: <Leaf className="w-6 h-6" />,
    features: [
      "6 hand-cut premium bouquets — all 6 guaranteed",
      "Season window: June through October",
      "Intended bi-weekly cadence — total count always honored",
      "Seasonal variety — no repeats",
      "Handwritten care card with each share",
      "Member-only early shop access",
      "\"This Week's Blooms\" email preview",
    ],
  },
];

const FAQS = [
  {
    q: "When does the CSA season start?",
    a: "The 2026 season opens in mid-June, when our first summer blooms — zinnias, sunflowers, and early dahlias — are ready to cut. Both shares run through October, just ahead of OKC's average first frost. We intend to hold to a weekly or bi-weekly cadence, but we're farmers first — and Mother Nature doesn't always follow a calendar. What we promise is this: every bouquet in your share will be delivered before the season closes. Your count is sacred. Your schedule is our best intention.",
  },
  {
    q: "Where do I pick up my flowers?",
    a: "We are establishing a central pickup hub in the OKC metro area — the exact location will be announced before the season opens. Local delivery is also available when possible for an additional $12 per delivery. All confirmed members will receive pickup and delivery details via email before the first share.",
  },
  {
    q: "What if I can't make a pickup?",
    a: "Life happens. Members can skip up to 2 weeks per season with 48 hours' notice. Skipped shares are not refunded but can be gifted to a friend — just let us know their name.",
  },
  {
    q: "What varieties will be in my bouquets?",
    a: "Every bouquet is different and reflects what's at peak bloom that week. Spring shares feature ranunculus, larkspur, lisianthus, sweet peas, and peonies. Summer transitions to zinnias, sunflowers, and celosia. Fall brings dahlias, amaranth, and rudbeckia. We never repeat the same bouquet twice.",
  },
  {
    q: "Are the flowers really organic?",
    a: "Yes — no synthetic pesticides, no synthetic fertilizers, ever. We use compost, cover crops, and beneficial insects. Our soil is alive, and that's what makes our flowers last longer in the vase.",
  },
  {
    q: "Can I give a CSA share as a gift?",
    a: "Absolutely. At checkout, add a gift message and the recipient's name. We'll include a handwritten note in the first bouquet. Gift shares are one of our most popular purchases.",
  },
  {
    q: "What is your refund policy?",
    a: "CSA shares are prepaid and non-refundable after the first fulfillment. If a share is missed due to crop failure or weather, we will extend your share by one week at no charge. We stand behind every bouquet.",
  },
  {
    q: "How many shares are available?",
    a: "We cap each season at 30 total shares to ensure every member receives a bouquet of the highest quality. Once we're sold out, we're sold out. Joining the Bloom Watch list is the best way to be notified when the next season opens.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CSALanding() {
  const [selectedTier, setSelectedTier] = useState<Tier>("weekly");
  const [addDelivery, setAddDelivery] = useState(false);
  const [addDried, setAddDried] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure checkout…");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Checkout failed. Please try again.");
    },
  });

  const subscribeMutation = trpc.bloomWatch.subscribe.useMutation({
    onSuccess: (data) => {
      setSubscribed(true);
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const selectedConfig = TIERS.find((t) => t.id === selectedTier)!;

  const totalPrice =
    selectedConfig.price +
    (addDelivery ? 12 * selectedConfig.bouquets : 0) +
    (addDried && selectedTier !== "weekly" ? 45 : 0);

  const getProductId = (tier: Tier): string => {
    const map: Record<Tier, string> = {
      weekly: "weekly-bloom-share",
      biweekly: "biweekly-bloom-share",
    };
    return map[tier];
  };

  const handleCheckout = () => {
    checkoutMutation.mutate({
      productId: getProductId(selectedTier),
      origin: window.location.origin,
      isGift: isGift || undefined,
      giftRecipient: isGift && giftRecipient ? giftRecipient : undefined,
      giftMessage: isGift && giftMessage ? giftMessage : undefined,
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, source: "csa-landing" });
  };

  const spotsLeft = 7; // Dynamic scarcity — can be wired to DB later

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0F0A06", color: "#F5EFE6", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Minimal Nav ─────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(15,10,6,0.95)", borderBottom: "1px solid rgba(212,168,83,0.15)" }}
      >
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#8B2500" }}
            >
              <Flower2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "#F5EFE6", letterSpacing: "0.05em" }}>
                Red Dirt Blooms
              </div>
              <div className="text-xs" style={{ color: "#D4A853" }}>
                CSA Flower Subscriptions
              </div>
            </div>
          </div>
        </Link>
        <a
          href="#tiers"
          className="hidden md:block text-sm font-medium px-5 py-2 rounded-full transition-all"
          style={{ background: "#8B2500", color: "#F5EFE6" }}
        >
          Reserve Your Share
        </a>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20"
        style={{
          background:
            "linear-gradient(to bottom, #0F0A06 0%, #1A0E08 40%, #0F0A06 100%)",
        }}
      >
        {/* Decorative grain overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Scarcity badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(139,37,0,0.3)", border: "1px solid rgba(139,37,0,0.5)", color: "#E8A87C" }}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Only {spotsLeft} shares remaining for the 2026 season
          </div>

          <h1
            className="mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              color: "#F5EFE6",
            }}
          >
            Oklahoma's Most{" "}
            <em style={{ color: "#D4A853", fontStyle: "italic" }}>Coveted</em>
            <br />
            Flower Subscription
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#B8A898" }}
          >
            Hand-cut at peak bloom. Wrapped by hand. Delivered or picked up fresh
            the same morning. Grown from Oklahoma red dirt — no chemicals, no
            imports, no shortcuts.
          </p>

          {/* Season badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: <Leaf className="w-4 h-4" />, label: "Spring", sub: "April – June" },
              { icon: <Sun className="w-4 h-4" />, label: "Summer", sub: "July – August" },
              { icon: <Snowflake className="w-4 h-4" />, label: "Fall", sub: "September – October" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.25)", color: "#D4A853" }}
              >
                {s.icon}
                <span className="font-medium">{s.label}</span>
                <span style={{ color: "#8A7A6A" }}>{s.sub}</span>
              </div>
            ))}
          </div>

          <a
            href="#tiers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105"
            style={{ background: "#8B2500", color: "#F5EFE6" }}
          >
            View Subscription Tiers
            <ArrowRight className="w-4 h-4" />
          </a>

          <p className="mt-4 text-sm" style={{ color: "#6A5A4A" }}>
            Pre-pay once. Flowers arrive weekly. Cancel before first fulfillment for a full refund.
          </p>
        </div>
      </section>

      {/* ── Why Red Dirt Blooms ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#130C07" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#D4A853" }}>
              Why Members Choose Us
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 600,
                color: "#F5EFE6",
              }}
            >
              Not Your Grocery Store Flowers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Grown Here",
                body: "Every stem is grown on our farm in central Oklahoma. No imports, no wholesalers, no middlemen. What's in your bouquet was in the ground 24 hours ago.",
              },
              {
                icon: <Leaf className="w-6 h-6" />,
                title: "Certified Organic Practices",
                body: "No synthetic pesticides. No synthetic fertilizers. Our soil is alive — and that's exactly why our flowers last 10–14 days in the vase instead of 5.",
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Premium Varieties",
                body: "We grow specialty varieties you won't find anywhere else in Oklahoma — lisianthus, ranunculus, sweet peas, dahlias, and heirloom zinnias in colors that stop people in their tracks.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-2xl"
                style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.12)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "rgba(139,37,0,0.3)", color: "#D4A853" }}
                >
                  {item.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "#F5EFE6" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A7A6A" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Harvest Calendar ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#0F0A06" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#5D8A5E" }}>
              Oklahoma Growing Season
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: "#F5EFE6",
              }}
            >
              22 Weeks from Red Dirt to Your Door
            </h2>
            <p className="mt-3 text-sm" style={{ color: "#6A5A4A" }}>
              Central Oklahoma's last frost: ~April 1 · First frost: ~October 23
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                season: "Spring",
                months: "April – June",
                weeks: "8–10 weeks",
                varieties: "Ranunculus, Larkspur, Snapdragons, Sweet Peas, Lisianthus, Peonies",
                color: "#D4A853",
                bg: "rgba(212,168,83,0.08)",
              },
              {
                season: "Summer",
                months: "July – August",
                weeks: "6–8 weeks",
                varieties: "Zinnias, Sunflowers, Celosia, Gomphrena, Marigolds",
                color: "#C0392B",
                bg: "rgba(192,57,43,0.08)",
              },
              {
                season: "Fall",
                months: "Sept – October",
                weeks: "6–8 weeks",
                varieties: "Dahlias, Amaranth, Rudbeckia, Strawflower, Cosmos",
                color: "#5D8A5E",
                bg: "rgba(93,138,94,0.08)",
              },
            ].map((s) => (
              <div
                key={s.season}
                className="p-6 rounded-2xl text-center"
                style={{ background: s.bg, border: `1px solid ${s.color}30` }}
              >
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.color }}>
                  {s.season}
                </div>
                <div className="text-xs font-medium mb-1" style={{ color: s.color }}>
                  {s.months}
                </div>
                <div className="text-xs mb-3" style={{ color: "#6A5A4A" }}>
                  {s.weeks}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "#8A7A6A" }}>
                  {s.varieties}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CSAWhyOrganicSection />
      {/* ── Tier Selector ────────────────────────────────────────────────────── */}
      <section id="tiers" className="py-24 px-6" style={{ background: "#130C07" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#D4A853" }}>
              2026 CSA Shares
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 600,
                color: "#F5EFE6",
              }}
            >
              Choose Your Share
            </h2>
            <p className="mt-3" style={{ color: "#6A5A4A" }}>
              All shares are prepaid and include member-only early shop access.
            </p>
          </div>

          {/* Tier cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className="relative text-left p-8 rounded-2xl transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    selectedTier === tier.id
                      ? `linear-gradient(135deg, ${tier.accent}20, ${tier.accent}08)`
                      : "rgba(255,255,255,0.03)",
                  border: `2px solid ${selectedTier === tier.id ? tier.accent : "rgba(255,255,255,0.06)"}`,
                  transform: selectedTier === tier.id ? "translateY(-4px)" : "none",
                  boxShadow: selectedTier === tier.id ? `0 20px 60px ${tier.accent}20` : "none",
                }}
              >
                {tier.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                    style={{ background: tier.accent, color: "#0F0A06" }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${tier.accent}20`, color: tier.accent }}
                  >
                    {tier.icon}
                  </div>
                  <div>
                    <div
                      className="font-semibold text-base"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#F5EFE6" }}
                    >
                      {tier.name}
                    </div>
                    <div className="text-xs" style={{ color: "#6A5A4A" }}>
                      {tier.frequency} · {tier.weeks} weeks
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span
                    className="text-4xl font-bold"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: tier.accent }}
                  >
                    ${tier.price}
                  </span>
                  <span className="text-sm ml-2" style={{ color: "#6A5A4A" }}>
                    total · ${tier.perBouquet}/bouquet
                  </span>
                </div>

                <div className="text-xs mb-4" style={{ color: "#5D8A5E" }}>
                  Save ${tier.savings} vs. retail (${tier.retailValue} value)
                </div>

                <ul className="space-y-2">
                  {tier.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#8A7A6A" }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: tier.accent }} />
                      {f}
                    </li>
                  ))}
                  {tier.features.length > 4 && (
                    <li className="text-xs" style={{ color: tier.accent }}>
                      +{tier.features.length - 4} more benefits
                    </li>
                  )}
                </ul>
              </button>
            ))}
          </div>

          {/* Selected tier detail + add-ons */}
          <div
            className="rounded-2xl p-8 mb-8"
            style={{
              background: `linear-gradient(135deg, ${selectedConfig.accent}12, rgba(255,255,255,0.02))`,
              border: `1px solid ${selectedConfig.accent}30`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Full feature list */}
              <div className="flex-1">
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#F5EFE6" }}
                >
                  {selectedConfig.name} — Everything Included
                </h3>
                <ul className="space-y-2.5">
                  {selectedConfig.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#B8A898" }}>
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: selectedConfig.accent }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add-ons + checkout */}
              <div className="md:w-72 flex-shrink-0">
                <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "#6A5A4A" }}>
                  Enhance Your Share
                </h4>

                {/* Delivery add-on */}
                <label
                  className="flex items-start gap-3 p-4 rounded-xl mb-3 cursor-pointer transition-all"
                  style={{
                    background: addDelivery ? "rgba(93,138,94,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${addDelivery ? "#5D8A5E" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={addDelivery}
                    onChange={(e) => setAddDelivery(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#F5EFE6" }}>
                      <Truck className="w-4 h-4" style={{ color: "#5D8A5E" }} />
                      Local Delivery
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#6A5A4A" }}>
                      +$12/delivery · OKC, Edmond, Norman, Nichols Hills
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#5D8A5E" }}>
                      +${12 * selectedConfig.bouquets} total
                    </div>
                  </div>
                </label>

                {/* Dried add-on (not for Full Bloom — already included) */}
                {selectedTier !== "weekly" && (
                  <label
                    className="flex items-start gap-3 p-4 rounded-xl mb-6 cursor-pointer transition-all"
                    style={{
                      background: addDried ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${addDried ? "#D4A853" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={addDried}
                      onChange={(e) => setAddDried(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#F5EFE6" }}>
                        <Package className="w-4 h-4" style={{ color: "#D4A853" }} />
                        Dried Flower Bonus
                      </div>
                      <div className="text-xs mt-1" style={{ color: "#6A5A4A" }}>
                        One everlasting arrangement at season end
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#D4A853" }}>
                        +$45
                      </div>
                    </div>
                  </label>
                )}

                {/* Price summary */}
                <div
                  className="p-4 rounded-xl mb-4"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex justify-between text-sm mb-2" style={{ color: "#8A7A6A" }}>
                    <span>{selectedConfig.name}</span>
                    <span>${selectedConfig.price}</span>
                  </div>
                  {addDelivery && (
                    <div className="flex justify-between text-sm mb-2" style={{ color: "#8A7A6A" }}>
                      <span>Local Delivery ({selectedConfig.bouquets}×)</span>
                      <span>+${12 * selectedConfig.bouquets}</span>
                    </div>
                  )}
                  {addDried && selectedTier !== "weekly" && (
                    <div className="flex justify-between text-sm mb-2" style={{ color: "#8A7A6A" }}>
                      <span>Dried Flower Bonus</span>
                      <span>+$45</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between text-base font-semibold pt-2 mt-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "#F5EFE6" }}
                  >
                    <span>Total</span>
                    <span style={{ color: selectedConfig.accent }}>${totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-4 rounded-full font-semibold text-base transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: selectedConfig.accent, color: "#0F0A06" }}
                >
                  {checkoutMutation.isPending ? "Opening Checkout…" : `Reserve My Share — $${totalPrice}`}
                </button>

                {/* Gift toggle */}
                <div className="mt-4 mb-2">
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isGift ? "rgba(212,168,83,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isGift ? "rgba(212,168,83,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="mt-0"
                    />
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: isGift ? "#D4A853" : "#F5EFE6" }}>
                      <Gift className="w-4 h-4" style={{ color: "#D4A853" }} />
                      This is a gift
                    </div>
                  </label>

                  {isGift && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(245,239,230,0.45)" }}>
                          Recipient’s Name
                        </label>
                        <input
                          type="text"
                          value={giftRecipient}
                          onChange={(e) => setGiftRecipient(e.target.value)}
                          placeholder="Who is this for?"
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(212,168,83,0.3)",
                            color: "#F5EFE6",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(245,239,230,0.45)" }}>
                          Gift Message
                        </label>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          rows={2}
                          placeholder="A note to include with the first bouquet…"
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(212,168,83,0.3)",
                            color: "#F5EFE6",
                          }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(212,168,83,0.6)" }}>
                        🌸 We’ll include a handwritten note in the first bouquet.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-center mt-3" style={{ color: "#4A3A2A" }}>
                  Secure checkout via Stripe · Full refund before first fulfillment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SampleWeekDemo />

      {/* ── Pickup Info ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#0F0A06" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="p-8 rounded-2xl"
              style={{ background: "rgba(93,138,94,0.08)", border: "1px solid rgba(93,138,94,0.2)" }}
            >
              <MapPin className="w-8 h-8 mb-4" style={{ color: "#5D8A5E" }} />
              <h3
                className="text-2xl font-semibold mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F5EFE6" }}
              >
                Pickup Hub — Coming Soon
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#8A7A6A" }}>
                We are establishing a central pickup hub in the OKC metro area.
                The exact location will be announced before the season opens.
                All confirmed members will receive full details via email.
              </p>
              <div className="text-sm font-medium" style={{ color: "#5D8A5E" }}>
                OKC Metro · Location TBA · Sign up for Bloom Watch
              </div>
            </div>

            <div
              className="p-8 rounded-2xl"
              style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)" }}
            >
              <Truck className="w-8 h-8 mb-4" style={{ color: "#D4A853" }} />
              <h3
                className="text-2xl font-semibold mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F5EFE6" }}
              >
                Local Delivery
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#8A7A6A" }}>
                Add delivery at checkout for $12 per bouquet. We deliver to
                the OKC metro area when order volume and harvest day logistics
                allow. Delivery availability is confirmed with each order.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Edmond", "Nichols Hills", "Midtown OKC", "Norman", "Yukon"].map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ background: "rgba(212,168,83,0.15)", color: "#D4A853" }}
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CSAMemberSection />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#130C07" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#F5EFE6",
              }}
            >
              Questions About the CSA
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-all"
                  style={{ background: openFaq === i ? "rgba(212,168,83,0.08)" : "rgba(255,255,255,0.02)" }}
                >
                  <span className="text-sm font-medium pr-4" style={{ color: "#F5EFE6" }}>
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "#D4A853" }} />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#6A5A4A" }} />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5" style={{ background: "rgba(212,168,83,0.04)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "#8A7A6A" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bloom Watch CTA ──────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{
          background: "linear-gradient(135deg, #1A0E08 0%, #0F0A06 100%)",
          borderTop: "1px solid rgba(212,168,83,0.1)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Calendar className="w-10 h-10 mx-auto mb-6" style={{ color: "#D4A853" }} />
          <h2
            className="mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#F5EFE6",
            }}
          >
            Sold Out? Join the Bloom Watch.
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#6A5A4A" }}>
            When shares sell out, the Bloom Watch list is the only way to get
            first access to the next season. We open renewals to the list before
            anyone else.
          </p>

          {subscribed ? (
            <div
              className="flex items-center justify-center gap-3 py-4 px-8 rounded-full"
              style={{ background: "rgba(93,138,94,0.2)", border: "1px solid #5D8A5E", color: "#5D8A5E" }}
            >
              <CheckCircle2 className="w-5 h-5" />
              You're on the Bloom Watch list!
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3 rounded-full text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(212,168,83,0.3)",
                  color: "#F5EFE6",
                }}
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: "#8B2500", color: "#F5EFE6" }}
              >
                {subscribeMutation.isPending ? "…" : "Notify Me"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#3A2A1A" }}
      >
        <Link href="/">
          <span className="hover:text-amber-700 cursor-pointer transition-colors">
            ← Back to Red Dirt Blooms
          </span>
        </Link>
        <span className="mx-4">·</span>
        <span>© 2026 Red Dirt Blooms · Central Oklahoma · Grown Organically</span>
      </footer>
    </div>
  );
}
