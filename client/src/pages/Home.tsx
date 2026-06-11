/**
 * Red Dirt Blooms — Home Page
 * Prairie Modern design: asymmetric editorial layout, warm earthy tones,
 * Indian Blanket wildflower color system.
 * 
 * Sections:
 * 1. Hero (full-viewport with farm field image)
 * 2. Trust Bar
 * 3. Instagram/Bloom Diary Strip
 * 4. What's in the Ground (Anticipation + Email Capture)
 * 5. Fresh Harvest Preview (Shop)
 * 6. Oklahoma Roots (Farm Story)
 * 7. Local Love (Testimonials)
 * 8. Join the Bloom Watch (Email Capture)
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, Flower2, Leaf, Heart, Star, ChevronRight, Mail, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import PrairieChicSection from "@/components/PrairieChicSection";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/hero-field-KrvhZ4N7ENMFTq3Gm7ZLW5.webp";
const BOUQUET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/harvest-bouquet-FabX3efg5cBChbv7p9NVxd.webp";
const FARMER_IMG = "/manus-storage/lance-garden-option2_3ea714c2.png";
const BLOOM_DIARY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/bloom-diary-6ogmYoPwmfDbMqCafamNte.webp";

// Flower varieties currently in the ground
const GROWING = [
  { name: "Queen Lime Zinnia", desc: "A rare dusty green-and-burgundy variety you won't find at any grocery store.", stage: 75, eta: "~2 weeks", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80" },
  { name: "Café au Lait Dahlia", desc: "Oklahoma's favorite — creamy blush petals with a warm caramel center.", stage: 45, eta: "~4 weeks", img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80" },
  { name: "Autumn Beauty Sunflower", desc: "Multicolored sunflowers in rust, gold, and burgundy — pure Oklahoma.", stage: 60, eta: "~3 weeks", img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&q=80" },
  { name: "Lisianthus 'Voyage'", desc: "The flower that looks like a rose but grows from our red dirt. Stunning.", stage: 30, eta: "~6 weeks", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
];

// Sample shop products
const PRODUCTS = [
  { name: "Red Dirt Harvest Bouquet", desc: "A hand-tied mix of whatever's best from today's cut.", price: "$28", qty: 7, img: BOUQUET_IMG },
  { name: "Zinnia Farmer's Bunch", desc: "10 stems of mixed zinnias, straight from the field.", price: "$18", qty: 12, img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80" },
  { name: "Weekly Bloom Share (12-Week)", desc: "12 weekly bouquets from June 12 through August 27. Fresh-cut Oklahoma flowers, every week.", price: "$396", qty: 3, img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80" },
];

// Testimonials — real customers
const TESTIMONIALS = [
  { name: "Leslie K.", city: "Norman, OK", text: "The flowers were beautiful. They made our event magical!", stars: 5 },
  { name: "Randy N.", city: "Oklahoma City, OK", text: "It's amazing what this guy can do with some seeds!", stars: 5 },
  { name: "Ellen D.", city: "Broken Arrow, OK", text: "Gorgeous. Just gorgeous!", stars: 5 },
];

// Fake Instagram posts
const INSTA_POSTS = [
  { id: 1, img: HERO_IMG, caption: "Day 14 — The zinnias are waking up 🌸", likes: 142, isVideo: false },
  { id: 2, img: BLOOM_DIARY_IMG, caption: "Harvest morning ☀️ Red dirt never looked so good", likes: 218, isVideo: true },
  { id: 3, img: BOUQUET_IMG, caption: "Today's cut — going to good homes 💐", likes: 189, isVideo: false },
  { id: 4, img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80", caption: "Sunflowers are showing off this week 🌻", likes: 97, isVideo: false },
];

function useIntersectionObserver(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersectionObserver(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function BloomProgress({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersectionObserver(ref);
  return (
    <div ref={ref} className="bloom-progress">
      <div
        className="bloom-progress-fill"
        style={{ width: visible ? `${pct}%` : "0%" }}
      />
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [bloomEmail, setBloomEmail] = useState("");
  // "Wake Me" inline capture: which flower card is expanded + the email typed
  const [wakeFlower, setWakeFlower] = useState<string | null>(null);
  const [wakeEmail, setWakeEmail] = useState("");

   const subscribeMutation = trpc.bloomWatch.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail("");
      setBloomEmail("");
    },
    onError: (err) => {
      toast.error("Couldn't sign you up: " + err.message);
    },
  });

  const handleBloomWatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, source: "homepage-section" });
  };
  const handleWakeMeUp = (flowerName: string) => {
    // First tap expands the inline email field on that card
    setWakeFlower((cur) => (cur === flowerName ? null : flowerName));
    setWakeEmail("");
  };
  const handleWakeSubmit = (e: React.FormEvent, flowerName: string) => {
    e.preventDefault();
    if (!wakeEmail) return;
    subscribeMutation.mutate(
      { email: wakeEmail, source: `wake-me:${flowerName}` },
      {
        onSuccess: () => {
          toast.success(`We'll wake you when the ${flowerName} is ready! 🌱`);
          setWakeFlower(null);
          setWakeEmail("");
        },
      }
    );
  };
  const handleHeroEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloomEmail) return;
    subscribeMutation.mutate({ email: bloomEmail, source: "hero" });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ===== HERO ===== */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Oklahoma flower farm at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay — dark at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1F1A]/80 via-[#2A1F1A]/20 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="font-accent text-[#E8A020] text-xl mb-3">Oklahoma Grown · Organically</div>
            <h1 className="font-heading text-[#F5F0E8] font-bold mb-4"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.05 }}>
              Grown from Red Dirt.<br />
              <em className="font-normal">Cut for You.</em>
            </h1>
            <p className="font-body text-[#F5F0E8]/80 text-lg mb-8 max-w-lg">
              Organic flowers, grown right here in Oklahoma — from the soil up. No chemicals, no imports, no shortcuts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/bloom-diary">
                <button className="inline-flex items-center gap-2 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-[#F5F0E8] font-body font-semibold px-6 py-3 rounded transition-colors">
                  <Play className="w-4 h-4" />
                  See What's Blooming
                </button>
              </Link>
              <Link href="/harvest-stand">
                <button className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold px-6 py-3 rounded transition-colors">
                  <Flower2 className="w-4 h-4" />
                  Shop the Harvest
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-[#B5451B] py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { icon: <Leaf className="w-4 h-4" />, text: "100% Organic" },
            { icon: <Flower2 className="w-4 h-4" />, text: "Oklahoma Grown" },
            { icon: <Heart className="w-4 h-4" />, text: "No Chemicals, Ever" },
            { icon: <Star className="w-4 h-4" />, text: "Local OKC Metro" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-[#F5F0E8] font-body text-sm font-medium">
              {item.icon}
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ===== INSTAGRAM / BLOOM DIARY STRIP ===== */}
      <section className="py-14 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="font-accent text-[#B5451B] text-lg mb-1">From the Field</div>
                <h2 className="font-heading text-[#2A1F1A] font-bold" style={{ fontSize: "2rem" }}>
                  The Bloom Diary
                </h2>
              </div>
              <Link href="/bloom-diary">
                <span className="hidden sm:flex items-center gap-1 font-body text-sm text-[#7A8C6E] hover:text-[#B5451B] transition-colors font-medium">
                  Watch the full diary <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INSTA_POSTS.map((post, i) => (
              <FadeUp key={post.id} delay={i * 80}>
                <Link href="/bloom-diary">
                  <div className="relative group overflow-hidden rounded aspect-square cursor-pointer">
                    <img
                      src={post.img}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {post.isVideo && (
                      <div className="absolute top-2 right-2 bg-black/50 rounded-full w-7 h-7 flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#2A1F1A]/0 group-hover:bg-[#2A1F1A]/50 transition-colors flex items-end p-3">
                      <p className="font-body text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity leading-tight">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={300}>
            <div className="mt-4 text-center sm:hidden">
              <Link href="/bloom-diary">
                <span className="inline-flex items-center gap-1 font-body text-sm text-[#7A8C6E] hover:text-[#B5451B] transition-colors font-medium">
                  Watch the full Bloom Diary <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <hr className="rust-rule mx-8" />

      {/* ===== WHAT'S IN THE GROUND ===== */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-3">
              <div className="font-accent text-[#B5451B] text-lg">The Anticipation</div>
            </div>
            <h2 className="font-heading text-[#2A1F1A] font-bold text-center mb-3" style={{ fontSize: "2.25rem" }}>
              What's in the Ground
            </h2>
            <p className="font-body text-[#2A1F1A]/60 text-center max-w-xl mx-auto mb-10 text-base">
              These beauties are still soaking up the Oklahoma sun. Drop your email and we'll holler the moment they're ready to cut.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GROWING.map((flower, i) => (
              <FadeUp key={flower.name} delay={i * 100}>
                <div className="bg-white rounded border border-[#B5451B]/10 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={flower.img}
                      alt={flower.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg mb-1">{flower.name}</h3>
                    <p className="font-body text-[#2A1F1A]/60 text-xs mb-3 leading-relaxed">{flower.desc}</p>

                    {/* Stage labels */}
                    <div className="flex justify-between font-body text-[9px] text-[#2A1F1A]/40 mb-1">
                      <span>Seedling</span>
                      <span>Bud</span>
                      <span>Bloom</span>
                      <span>Harvest</span>
                    </div>
                    <BloomProgress pct={flower.stage} />

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-accent text-[#7A8C6E] text-sm">{flower.eta}</span>
                        <button
                          onClick={() => handleWakeMeUp(flower.name)}
                          className="font-body text-xs font-semibold bg-[#B5451B] text-[#F5F0E8] px-3 py-1.5 rounded hover:bg-[#9e3c17] transition-colors"
                        >
                          {wakeFlower === flower.name ? "Never mind" : "Wake Me When It Blooms"}
                        </button>
                      </div>
                      {wakeFlower === flower.name && (
                        <form onSubmit={(e) => handleWakeSubmit(e, flower.name)} className="mt-3 flex gap-2">
                          <input
                            type="email"
                            value={wakeEmail}
                            onChange={(e) => setWakeEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoFocus
                            className="flex-1 min-w-0 border border-[#B5451B]/30 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:ring-1 focus:ring-[#B5451B]"
                          />
                          <button
                            type="submit"
                            disabled={subscribeMutation.isPending}
                            className="font-body text-xs font-semibold bg-[#7A8C6E] text-[#F5F0E8] px-3 py-1.5 rounded hover:bg-[#6a7a5e] transition-colors disabled:opacity-50"
                          >
                            {subscribeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Notify Me"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <hr className="rust-rule mx-8" />

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-[#2A1F1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="font-accent text-[#E8A020] text-lg mb-2">Simple as Oklahoma Sunshine</div>
              <h2 className="font-heading text-[#F5F0E8] font-bold" style={{ fontSize: "2.25rem" }}>
                From Red Dirt to Your Door
              </h2>
              <p className="font-body text-[#F5F0E8]/50 mt-3 max-w-xl mx-auto">
                No grocery store flowers. No middleman. Just fresh-cut Oklahoma blooms, straight from our hands to yours.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: "01",
                icon: <Leaf className="w-7 h-7" />,
                title: "Seeds Hit the Dirt",
                desc: "Every spring, we plant hundreds of varieties in Oklahoma's famous red soil. Organic only — no shortcuts.",
                color: "#7A8C6E",
              },
              {
                step: "02",
                icon: <Play className="w-7 h-7" />,
                title: "Watch Them Grow",
                desc: "Follow along on The Bloom Diary as we post short videos of each variety coming up from the ground.",
                color: "#E8A020",
              },
              {
                step: "03",
                icon: <Mail className="w-7 h-7" />,
                title: "Get the Holler",
                desc: "Bloom Watch subscribers get an email the moment a variety is ready to cut. First come, first served.",
                color: "#B5451B",
              },
              {
                step: "04",
                icon: <Heart className="w-7 h-7" />,
                title: "Flowers in Your Hands",
                desc: "Order online and pick up at the farm or get local OKC metro delivery. Fresh-cut, same day.",
                color: "#E8A020",
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 100}>
                <div className="relative">
                  {/* Connector line */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t border-dashed border-[#F5F0E8]/10 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(50% + 1.5rem)" }} />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[#F5F0E8]"
                      style={{ background: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div className="font-accent text-[#F5F0E8]/20 text-4xl font-bold mb-2 leading-none">{item.step}</div>
                    <h3 className="font-heading text-[#F5F0E8] font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="font-body text-[#F5F0E8]/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp>
            <div className="mt-12 text-center">
              <Link
                href="/harvest-stand"
                className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold px-8 py-3 rounded transition-colors"
              >
                Shop the Harvest Stand
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <hr className="rust-rule mx-8" />
      {/* ===== FRESH HARVEST (SHOP PREVIEW) ===== */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="font-accent text-[#B5451B] text-lg mb-1">Ready to Cut</div>
                <h2 className="font-heading text-[#2A1F1A] font-bold" style={{ fontSize: "2.25rem" }}>
                  Fresh from the Harvest Stand
                </h2>
              </div>
              <Link href="/harvest-stand">
                <span className="hidden sm:flex items-center gap-1 font-body text-sm text-[#7A8C6E] hover:text-[#B5451B] transition-colors font-medium">
                  Shop all available blooms <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PRODUCTS.map((product, i) => (
              <FadeUp key={product.name} delay={i * 100}>
                <div className="bg-white rounded border border-[#B5451B]/10 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg leading-tight">{product.name}</h3>
                      <span className="font-heading text-[#B5451B] font-bold text-xl flex-shrink-0">{product.price}</span>
                    </div>
                    <p className="font-body text-[#2A1F1A]/60 text-xs mb-3 leading-relaxed">{product.desc}</p>
                    <div className="scarcity-badge mb-3">
                      <Flower2 className="w-3 h-3" />
                      Only {product.qty} left from today's harvest
                    </div>
                    <Link href="/harvest-stand">
                      <button className="w-full bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold text-sm py-2.5 rounded transition-colors">
                        Add to Cart
                      </button>
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={300}>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/harvest-stand">
                <span className="inline-flex items-center gap-1 font-body text-sm text-[#7A8C6E] hover:text-[#B5451B] transition-colors font-medium">
                  Shop all available blooms <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===== OKLAHOMA ROOTS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="relative">
                <img
                  src={FARMER_IMG}
                  alt="The farmer at Red Dirt Blooms"
                  className="w-full rounded object-cover"
                  style={{ maxHeight: "520px", objectPosition: "center" }}
                />
                <div className="absolute -bottom-4 -right-4 bg-[#B5451B] text-[#F5F0E8] px-5 py-3 rounded shadow-lg">
                  <div className="font-accent text-lg">Oklahoma Grown</div>
                  <div className="font-body text-xs opacity-80">Since Day One</div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <div>
                <div className="font-accent text-[#B5451B] text-xl mb-3">Roots & Story</div>
                <h2 className="font-heading text-[#2A1F1A] font-bold mb-5" style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
                  Born from the<br />
                  <em className="text-[#B5451B]">Red Dirt</em>
                </h2>
                <p className="font-body text-[#2A1F1A]/70 text-base leading-relaxed mb-4">
                  Every flower on this farm starts in Oklahoma's famous Port Silt Loam — that deep, iron-rich red soil that gives our state its distinctive color. We believe the land you grow in shapes everything about what comes up from it.
                </p>
                <p className="font-body text-[#2A1F1A]/70 text-base leading-relaxed mb-6">
                  No chemicals. No imports. No shortcuts. Just seeds, red dirt, Oklahoma sunshine, and the kind of patience that farming teaches you. When you buy from Red Dirt Blooms, you're buying something that couldn't have come from anywhere else.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {[
                    { label: "100%", sub: "Organic" },
                    { label: "OKC", sub: "Metro Delivery" },
                    { label: "No", sub: "Chemicals Ever" },
                  ].map((stat) => (
                    <div key={stat.sub} className="text-center">
                      <div className="font-heading text-[#B5451B] font-bold" style={{ fontSize: "1.75rem" }}>{stat.label}</div>
                      <div className="font-body text-xs text-[#2A1F1A]/50 uppercase tracking-wide">{stat.sub}</div>
                    </div>
                  ))}
                </div>
                <Link href="/roots-and-story">
                  <button className="inline-flex items-center gap-2 border-2 border-[#B5451B] text-[#B5451B] hover:bg-[#B5451B] hover:text-[#F5F0E8] font-body font-semibold px-5 py-2.5 rounded transition-colors">
                    Read the full story <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== PRAIRIE CHIC ===== */}
      <PrairieChicSection />

      {/* ===== LOCAL LOVE (TESTIMONIALS) ===== */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-10">
              <div className="font-accent text-[#B5451B] text-lg mb-1">Oklahoma Neighbors</div>
              <h2 className="font-heading text-[#2A1F1A] font-bold" style={{ fontSize: "2.25rem" }}>
                Local Love
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="bg-white rounded border border-[#B5451B]/10 p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#E8A020] text-[#E8A020]" />
                    ))}
                  </div>
                  <p className="font-body text-[#2A1F1A]/70 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <div className="font-body font-semibold text-[#2A1F1A] text-sm">{t.name}</div>
                    <div className="font-accent text-[#B5451B] text-sm">{t.city}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== JOIN THE BLOOM WATCH ===== */}
      <section className="py-20 bg-[#B5451B] grain-overlay">
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <FadeUp>
            <div className="font-accent text-[#E8A020] text-xl mb-3">Never Miss a Harvest</div>
            <h2 className="font-heading text-[#F5F0E8] font-bold mb-4" style={{ fontSize: "2.5rem" }}>
              Be the First to Know.
            </h2>
            <p className="font-body text-[#F5F0E8]/80 text-base mb-8 max-w-lg mx-auto">
              Join hundreds of Oklahoma flower lovers who get notified the moment a new harvest is ready. No spam. Just blooms.
            </p>
            <form onSubmit={handleBloomWatch} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-[#F5F0E8] border-0 rounded px-4 py-3 font-body text-[#2A1F1A] placeholder-[#2A1F1A]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold px-6 py-3 rounded transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4" />
                I'm In
              </button>
            </form>
            <p className="font-body text-[#F5F0E8]/50 text-xs mt-4">
              We respect your inbox. Unsubscribe anytime.
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
