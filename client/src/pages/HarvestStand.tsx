/**
 * Red Dirt Blooms — The Harvest Stand
 * Farm-direct bunch sales model with shopping cart.
 * Customers add items to cart (with quantity counters), then checkout all at once.
 */
import { useState, useCallback } from "react";
import { Flower2, Package, Loader2, Leaf, Sparkles, ShoppingCart, Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "fresh" | "subscriptions";
type PricingTier = "premium" | "specialty" | "focal";
type StemSize = 2 | 4 | 6;

interface BunchVariety {
  id: string;
  variety: string;
  description: string;
  tier: PricingTier;
  focalPrice?: number; // cents, only for focal tier
  photoUrl?: string;
  inStock: boolean;
  badge?: string;
}

interface CartItem {
  varietyId: string;
  variety: string;
  stemSize: StemSize;
  tier: PricingTier;
  priceCents: number;
  quantity: number;
  photoUrl?: string;
  stripePriceId: string;
}

// ── Tier pricing (cents) ───────────────────────────────────────────────────────
const TIER_PRICES: Record<PricingTier, Record<StemSize, number>> = {
  premium:   { 2: 500,  4: 900,  6: 1200 },
  specialty: { 2: 900,  4: 1500, 6: 2100 },
  focal:     { 2: 0,    4: 0,    6: 0    },
};

function getPrice(tier: PricingTier, size: StemSize, focalPrice?: number): number {
  if (tier === "focal") return focalPrice ?? 0;
  return TIER_PRICES[tier][size];
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function getProductId(tier: PricingTier, size: StemSize): string {
  if (tier === "focal") return `premium-${size}stem`;
  return `${tier}-${size}stem`;
}

// Stripe price IDs per variety + stem size
// Sourced directly from Stripe account 51TR6ztGrVUHindMr
const STRIPE_PRICE_IDS: Record<string, Record<StemSize, string>> = {
  // Premium tier
  gaura:      { 2: "price_1TeTfeGrVUHindMrxaSH8N1p", 4: "price_1TeTfgGrVUHindMrr4laOhGp", 6: "price_1TeTfiGrVUHindMrQiQtMHzl" },
  yarrow:     { 2: "price_1TeTfkGrVUHindMrzFFPd8h7", 4: "price_1TeTfmGrVUHindMrkivW23pQ", 6: "price_1TeTfoGrVUHindMrOqQ20bth" },
  "yarrow-red": { 2: "price_1TeTfqGrVUHindMrzs00fACZ", 4: "price_1TeTfsGrVUHindMr6Y9A0ZZD", 6: "price_1TeTfuGrVUHindMr39MNleKl" },
  // Specialty tier
  "lambs-ear":  { 2: "price_1TeTfxGrVUHindMrnrieqF4x", 4: "price_1TeTfzGrVUHindMr2cIBw33i", 6: "price_1TeTg1GrVUHindMrk4kbGzOC" },
  stjohnswort:  { 2: "price_1TeTg3GrVUHindMrZjT8zsCg", 4: "price_1TeTg5GrVUHindMrGW0qRQQl", 6: "price_1TeTg7GrVUHindMrZuWJikq2" },
  beebalm:      { 2: "price_1TeTg9GrVUHindMr9UWO0nDf", 4: "price_1TeTgBGrVUHindMrp9hNFQv6", 6: "price_1TeTgDGrVUHindMr0wkzrPxc" },
  gomphrena:    { 2: "price_1TeTgFGrVUHindMrL8CFfzi6", 4: "price_1TeTgHGrVUHindMrqeow4KQ2", 6: "price_1TeTgJGrVUHindMrLIOOvikM" },
  verbena:      { 2: "price_1TeTgMGrVUHindMrRQZZgBkv", 4: "price_1TeTgOGrVUHindMr5LbRWhFc", 6: "price_1TedVmGrVUHindMrBjyz8ssB" },
};

function getStripePriceId(varietyId: string, size: StemSize): string {
  return STRIPE_PRICE_IDS[varietyId]?.[size] || "";
}

// ── Launch varieties ───────────────────────────────────────────────────────────
const LAUNCH_VARIETIES: BunchVariety[] = [
  {
    id: "gaura",
    variety: "Gaura",
    description: "Delicate white-to-pink wand-like blooms that dance in the breeze. Perfect filler for airy, romantic arrangements.",
    tier: "premium",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_5_gaura_pink_6f3b0da9.png",
  },
  {
    id: "yarrow",
    variety: "Yarrow (White)",
    description: "Flat-topped clusters of tiny blooms in creamy white. Excellent texture and structure, long vase life.",
    tier: "premium",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_6_yarrow_white_87cfb2b9.png",
  },
  {
    id: "yarrow-red",
    variety: "Yarrow (Red)",
    description: "Deep red and dark pink clustered blooms with golden stamen. Bold color and exceptional texture for statement arrangements.",
    tier: "premium",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_7_yarrow_red_c3d9e931.png",
  },
  {
    id: "lambs-ear",
    variety: "Lamb's Ear",
    description: "Soft, silver-green velvety foliage. The ultimate texture accent — adds depth and contrast to any arrangement.",
    tier: "specialty",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_8_lambsear_71bfbab7.png",
  },
  {
    id: "stjohnswort",
    variety: "St John's Wort",
    description: "Bright yellow star-shaped blooms with prominent stamens. Cheerful and long-lasting in arrangements.",
    tier: "specialty",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_4_hypericum_yellow_371b9b0a.png",
  },
  {
    id: "beebalm",
    variety: "Bee Balm (Pink)",
    description: "Shaggy, vibrant pink blooms with a wild, meadow feel. Unique texture that adds movement to any bouquet.",
    tier: "specialty",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_3_bee_balm_pink_ee16ef62.png",
  },
  {
    id: "gomphrena",
    variety: "Gomphrena (Red)",
    description: "Globe-shaped, clover-like blooms in deep red. Excellent dried flower — holds color and shape beautifully.",
    tier: "specialty",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_1_gomphrena_red_57aefb3b.png",
  },
  {
    id: "verbena",
    variety: "Verbena (Purple)",
    description: "Clusters of tiny purple blooms on long stems. Airy and delicate — perfect for adding color and texture.",
    tier: "specialty",
    inStock: true,
    badge: "Available Now",
    photoUrl: "/manus-storage/flower_2_verbena_purple_4730148f.png",
  },
];

const SUBSCRIPTION_PRODUCTS = [
  {
    id: "weekly-bloom-share",
    name: "Weekly Bloom Share — 12 Weeks",
    desc: "12 curated farm-direct deliveries across the full bloom season, June through October. We aim for weekly — but we're farmers first, and Mother Nature doesn't always follow a calendar. Your 12 deliveries are guaranteed before the season closes.",
    price: 396,
    savings: "Save $108",
    features: [
      "12 deliveries — all guaranteed",
      "Season window: June – October",
      "Weekly cadence, weather-permitting",
      "Priority harvest access",
      "Complimentary dried arrangement at season end",
    ],
    badge: "Best Value",
  },
  {
    id: "biweekly-bloom-share",
    name: "Bi-Weekly Bloom Share — 6 Deliveries",
    desc: "6 farm-direct deliveries every other week from June through October. Seasonal variety — no repeats.",
    price: 210,
    savings: "Save $42",
    features: [
      "6 deliveries — all guaranteed",
      "Season window: June – October",
      "Bi-weekly cadence, weather-permitting",
      "Seasonal variety — no repeats",
      "Handwritten care card",
    ],
    badge: null,
  },
];

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "fresh", label: "Fresh Bunches", icon: <Flower2 className="w-4 h-4" /> },
  { id: "subscriptions", label: "Bloom Box Subscriptions", icon: <Package className="w-4 h-4" /> },
];

const TIER_LABEL: Record<PricingTier, string> = {
  premium: "Premium",
  specialty: "Specialty",
  focal: "Focal",
};

const TIER_COLOR: Record<PricingTier, string> = {
  premium: "#7A8C6E",
  specialty: "#B5451B",
  focal: "#E8A020",
};

// ── Cart Drawer ────────────────────────────────────────────────────────────────
function CartDrawer({
  cart,
  onClose,
  onUpdateQty,
  onRemove,
  onCheckout,
  checkoutLoading,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
  checkoutLoading: boolean;
}) {
  const total = cart.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-sm flex flex-col bg-[#2A1F1A] border-l border-[#B5451B]/20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#B5451B]/20">
          <h2 className="font-heading text-[#F5F0E8] font-bold text-lg">Your Cart</h2>
          <button onClick={onClose} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-16">
              <Flower2 className="w-10 h-10 text-[#F5F0E8]/15 mx-auto mb-3" />
              <p className="font-body text-[#F5F0E8]/40 text-sm">Your cart is empty</p>
              <p className="font-body text-[#F5F0E8]/25 text-xs mt-1">Add some bunches to get started</p>
            </div>
          )}
          {cart.map((item) => {
            const key = `${item.varietyId}-${item.stemSize}`;
            return (
              <div key={key} className="flex gap-3 items-start">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.variety} className="w-14 h-14 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded bg-[#F5F0E8]/5 flex items-center justify-center flex-shrink-0">
                    <Flower2 className="w-6 h-6 text-[#F5F0E8]/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[#F5F0E8] text-sm font-semibold leading-tight">{item.variety}</p>
                  <p className="font-body text-[#E8A020] text-xs mt-0.5">{item.stemSize}-stem bunch · {formatPrice(item.priceCents)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQty(key, -1)}
                      className="w-6 h-6 rounded bg-[#F5F0E8]/10 text-[#F5F0E8] flex items-center justify-center hover:bg-[#F5F0E8]/20 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-[#F5F0E8] text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(key, 1)}
                      className="w-6 h-6 rounded bg-[#B5451B] text-[#F5F0E8] flex items-center justify-center hover:bg-[#9e3c17] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemove(key)}
                      className="ml-auto font-body text-xs text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-heading text-[#F5F0E8] text-sm font-bold flex-shrink-0">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-5 border-t border-[#B5451B]/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-[#F5F0E8]/60 text-sm">Order Total</span>
              <span className="font-heading text-[#F5F0E8] font-bold text-xl">{formatPrice(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={checkoutLoading}
              className="w-full bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body font-semibold text-sm py-3 rounded transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Secure Checkout
            </button>
            <p className="font-body text-xs text-center text-[#F5F0E8]/25">
              Powered by Stripe · Cut fresh for your order
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function HarvestStand() {
  const [activeTab, setActiveTab] = useState<Tab>("fresh");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [subLoadingKey, setSubLoadingKey] = useState<string | null>(null);

  const cartCheckoutMutation = trpc.checkout.createCartSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure checkout... 🌸");
        window.open(data.checkoutUrl, "_blank");
        setCartOpen(false);
      }
    },
    onError: (err) => {
      toast.error("Checkout failed: " + err.message);
    },
  });

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure checkout... 🌸");
        window.open(data.checkoutUrl, "_blank");
        setSubLoadingKey(null);
      }
    },
    onError: (err) => {
      toast.error("Checkout failed: " + err.message);
      setSubLoadingKey(null);
    },
  });

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  const addToCart = useCallback((variety: BunchVariety, size: StemSize) => {
    const priceCents = getPrice(variety.tier, size, variety.focalPrice);
    const key = `${variety.id}-${size}`;
    setCart((prev) => {
      const existing = prev.find((i) => `${i.varietyId}-${i.stemSize}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.varietyId}-${i.stemSize}` === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        varietyId: variety.id,
        variety: variety.variety,
        stemSize: size,
        tier: variety.tier,
        priceCents,
        quantity: 1,
        photoUrl: variety.photoUrl,
        stripePriceId: getStripePriceId(variety.id, size),
      }];
    });
    toast.success(`${variety.variety} ${size}-stem added to cart`, { duration: 1500 });
  }, []);

  const updateCartQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => `${i.varietyId}-${i.stemSize}` === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => `${i.varietyId}-${i.stemSize}` !== key));
  }, []);

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    cartCheckoutMutation.mutate({
      items: cart.map((i) => ({
        quantity: i.quantity,
        variety: i.variety,
        stemSize: i.stemSize,
        pricingTier: i.tier,
        priceCents: i.priceCents,
      })),
      origin: window.location.origin,
    });
  };

  const handleBuySubscription = (productId: string) => {
    setSubLoadingKey(productId);
    checkoutMutation.mutate({
      productId,
      origin: window.location.origin,
    });
    checkoutMutation.reset;
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onCheckout={handleCartCheckout}
          checkoutLoading={cartCheckoutMutation.isPending}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#2A1F1A] py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">Farm Direct</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            The Harvest Stand
          </h1>
          <p className="font-body text-[#F5F0E8]/70 text-base max-w-2xl mx-auto leading-relaxed">
            Pick your varieties. Pick your bunch size. Add to cart and checkout all at once.
            Farm-grown flowers, your way.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-body text-[#F5F0E8]/50">
            <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-[#7A8C6E]" /> Grown in Oklahoma red dirt</span>
            <span className="flex items-center gap-1.5"><Flower2 className="w-3.5 h-3.5 text-[#B5451B]" /> Cut to order</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#E8A020]" /> You arrange it</span>
          </div>
        </div>
      </section>

      {/* ── How It Works strip ──────────────────────────────────────────────── */}
      <div className="bg-[#2A1F1A]/5 border-b border-[#B5451B]/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            {[
              { step: "1", text: "Pick a variety" },
              { step: "2", text: "Choose bunch size (2, 4, or 6 stems)" },
              { step: "3", text: "Add to cart — mix & match varieties" },
              { step: "4", text: "Checkout once — we cut fresh for you" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#B5451B] text-[#F5F0E8] font-body font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {s.step}
                </span>
                <span className="font-body text-sm text-[#2A1F1A]/70">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs + Cart Button ──────────────────────────────────────────────── */}
      <div className="sticky top-16 lg:top-20 z-30 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#B5451B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 font-body text-sm font-medium px-4 py-2 rounded transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#B5451B] text-[#F5F0E8]"
                      : "text-[#2A1F1A]/60 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#2A1F1A] hover:bg-[#3a2a22] text-[#F5F0E8] font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#B5451B] text-[#F5F0E8] text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Fresh Bunches Tab */}
        {activeTab === "fresh" && (
          <div>
            {/* Pricing key */}
            <div className="mb-8 flex flex-wrap gap-3">
              {(["premium", "specialty"] as PricingTier[]).map((tier) => (
                <div key={tier} className="flex items-center gap-2 bg-white border border-[#B5451B]/10 rounded px-3 py-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: TIER_COLOR[tier] }}
                  />
                  <span className="font-body text-xs font-semibold text-[#2A1F1A]">{TIER_LABEL[tier]}</span>
                  <span className="font-body text-xs text-[#2A1F1A]/50">
                    2-stem {formatPrice(TIER_PRICES[tier][2])} · 4-stem {formatPrice(TIER_PRICES[tier][4])} · 6-stem {formatPrice(TIER_PRICES[tier][6])}
                  </span>
                </div>
              ))}
            </div>

            {/* Variety cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LAUNCH_VARIETIES.map((variety) => (
                <VarietyCard
                  key={variety.id}
                  variety={variety}
                  cart={cart}
                  onAddToCart={addToCart}
                  onUpdateQty={updateCartQty}
                />
              ))}
            </div>

            {/* Coming soon note */}
            <div className="mt-10 text-center py-8 border-t border-[#B5451B]/10">
              <p className="font-accent text-[#B5451B] text-lg mb-1">More varieties coming this season</p>
              <p className="font-body text-sm text-[#2A1F1A]/50 max-w-md mx-auto">
                Zinnias, Sunflowers, Gomphrena, Celosia, Ornamental Basil, Strawflower, and more are growing now.
                Join Bloom Watch to get notified when new varieties hit the stand.
              </p>
            </div>

            {/* Floating cart summary bar */}
            {cartCount > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-3 bg-[#2A1F1A] text-[#F5F0E8] font-body font-semibold text-sm px-6 py-3.5 rounded-full shadow-xl hover:bg-[#3a2a22] transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cartCount} {cartCount === 1 ? "bunch" : "bunches"} in cart</span>
                  <span className="text-[#E8A020] font-bold">· {formatPrice(cartTotal)}</span>
                  <span className="bg-[#B5451B] text-[#F5F0E8] text-xs px-2 py-0.5 rounded-full ml-1">Checkout →</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bloom Box Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-2xl mb-2">Bloom Box Subscriptions</h2>
              <p className="font-body text-[#2A1F1A]/60 text-sm max-w-lg mx-auto">
                Reserve your spot for the season. We'll cut fresh and deliver throughout the bloom window — June through October.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUBSCRIPTION_PRODUCTS.map((p) => (
                <div key={p.id} className="bg-white rounded-lg border border-[#B5451B]/10 overflow-hidden flex flex-col">
                  {p.badge && (
                    <div className="bg-[#B5451B] text-[#F5F0E8] font-body font-semibold text-xs text-center py-1.5 px-4">
                      {p.badge}
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-heading text-[#2A1F1A] font-bold text-lg mb-2">{p.name}</h3>
                    <p className="font-body text-sm text-[#2A1F1A]/60 leading-relaxed mb-4">{p.desc}</p>
                    <ul className="space-y-1.5 mb-6 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 font-body text-xs text-[#2A1F1A]/70">
                          <Flower2 className="w-3 h-3 text-[#7A8C6E] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-heading text-[#B5451B] font-bold text-2xl">${p.price}</span>
                      <span className="font-body text-xs text-[#7A8C6E] font-semibold">{p.savings}</span>
                    </div>
                    <button
                      onClick={() => handleBuySubscription(p.id)}
                      disabled={checkoutMutation.isPending && subLoadingKey === p.id}
                      className="w-full bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body font-semibold text-sm py-2.5 rounded transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {checkoutMutation.isPending && subLoadingKey === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Reserve My Spot — Secure Checkout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </div>
  );
}

// ── Variety Card ───────────────────────────────────────────────────────────────
function VarietyCard({
  variety,
  cart,
  onAddToCart,
  onUpdateQty,
}: {
  variety: BunchVariety;
  cart: CartItem[];
  onAddToCart: (variety: BunchVariety, size: StemSize) => void;
  onUpdateQty: (key: string, delta: number) => void;
}) {
  const sizes: StemSize[] = [2, 4, 6];

  return (
    <div className={`bg-white rounded-lg border border-[#B5451B]/10 overflow-hidden flex flex-col ${!variety.inStock ? "opacity-60" : ""}`}>
      {/* Photo */}
      <div className="relative bg-[#2A1F1A]/5 aspect-square overflow-hidden">
        {variety.photoUrl ? (
          <img src={variety.photoUrl} alt={variety.variety} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Flower2 className="w-10 h-10 text-[#2A1F1A]/15" />
            <span className="font-body text-xs text-[#2A1F1A]/25">Photo coming soon</span>
          </div>
        )}
        {/* Tier badge */}
        <span
          className="absolute top-3 left-3 font-body text-xs font-semibold px-2 py-0.5 rounded text-white"
          style={{ backgroundColor: TIER_COLOR[variety.tier] }}
        >
          {TIER_LABEL[variety.tier]}
        </span>
        {/* Availability badge */}
        {variety.badge && (
          <span className="absolute top-3 right-3 font-body text-xs font-semibold px-2 py-0.5 rounded bg-[#E8A020] text-[#2A1F1A]">
            {variety.badge}
          </span>
        )}
        {!variety.inStock && (
          <div className="absolute inset-0 bg-[#F5F0E8]/70 flex items-center justify-center">
            <span className="font-body text-sm font-semibold text-[#2A1F1A]/60 bg-[#F5F0E8] px-3 py-1 rounded">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-[#2A1F1A] font-bold text-xl mb-1">{variety.variety}</h3>
        <p className="font-body text-sm text-[#2A1F1A]/60 leading-relaxed mb-5 flex-1">{variety.description}</p>

        {/* Bunch size buttons */}
        <div className="space-y-2">
          <p className="font-body text-xs text-[#2A1F1A]/40 uppercase tracking-wide font-semibold mb-2">Choose your bunch size</p>
          {sizes.map((size) => {
            const priceCents = getPrice(variety.tier, size, variety.focalPrice);
            const key = `${variety.id}-${size}`;
            const cartItem = cart.find((i) => `${i.varietyId}-${i.stemSize}` === key);
            const qty = cartItem?.quantity ?? 0;

            return (
              <div key={size} className="flex items-center gap-2">
                {qty === 0 ? (
                  // "Add to Cart" button
                  <button
                    onClick={() => variety.inStock && onAddToCart(variety, size)}
                    disabled={!variety.inStock}
                    className="flex-1 flex items-center justify-between bg-[#F5F0E8] hover:bg-[#B5451B]/8 border border-[#B5451B]/15 hover:border-[#B5451B]/40 text-[#2A1F1A] font-body text-sm font-medium px-4 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="flex items-center gap-2">
                      <Flower2 className="w-3.5 h-3.5 text-[#B5451B]/50 group-hover:text-[#B5451B] transition-colors" />
                      <span>{size}-stem bunch</span>
                    </span>
                    <span className="font-heading font-bold text-[#B5451B]">
                      {variety.tier === "focal" && !variety.focalPrice ? "Market price" : formatPrice(priceCents)}
                    </span>
                  </button>
                ) : (
                  // Quantity counter
                  <div className="flex-1 flex items-center justify-between bg-[#B5451B]/8 border border-[#B5451B]/30 rounded px-3 py-2">
                    <span className="font-body text-sm text-[#2A1F1A]/70">{size}-stem</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(key, -1)}
                        className="w-7 h-7 rounded bg-[#F5F0E8] border border-[#B5451B]/20 text-[#2A1F1A] flex items-center justify-center hover:bg-[#B5451B]/10 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body font-semibold text-[#B5451B] text-sm w-5 text-center">{qty}</span>
                      <button
                        onClick={() => onUpdateQty(key, 1)}
                        className="w-7 h-7 rounded bg-[#B5451B] text-[#F5F0E8] flex items-center justify-center hover:bg-[#9e3c17] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="font-heading font-bold text-[#B5451B] text-sm ml-1">{formatPrice(priceCents * qty)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
