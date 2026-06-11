/**
 * Red Dirt Blooms — Roots & Story (About Page)
 * Personal, honest, Oklahoma-proud. The farmer's story, the land, the philosophy.
 */
import { Leaf, Sun, Droplets, Heart } from "lucide-react";

const FARMER_IMG = "/manus-storage/lance-roots-option-b_6183aae9.png";
const HERO_FIELD = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/hero-field-KrvhZ4N7ENMFTq3Gm7ZLW5.webp";
const BOUQUET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/harvest-bouquet-FabX3efg5cBChbv7p9NVxd.webp";

const VARIETIES_GROWN = [
  { name: "Zinnia", desc: "Our workhorse. 12+ varieties.", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=300&q=80" },
  { name: "Dahlia", desc: "The crown jewel of the harvest.", img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=300&q=80" },
  { name: "Sunflower", desc: "Autumn Beauty multicolors.", img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=300&q=80" },
  { name: "Lisianthus", desc: "Looks like a rose, lasts longer.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
  { name: "Celosia", desc: "Flame and cockscomb varieties.", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=300&q=80" },
  { name: "Strawflower", desc: "Dried beautifully every time.", img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=300&q=80" },
];

export default function RootsAndStory() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <img src={HERO_FIELD} alt="The farm" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A1F1A]/60 to-[#2A1F1A]/85" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">Our Story</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Roots & Story
          </h1>
          <p className="font-body text-[#F5F0E8]/80 text-lg">
            Born from Oklahoma's red dirt. Grown with intention. Cut for you.
          </p>
        </div>
      </section>

      {/* The Farmer */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="font-accent text-[#B5451B] text-xl mb-3">The Farmer</div>
              <h2 className="font-heading text-[#2A1F1A] font-bold mb-5" style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
                Hi, I'm the guy<br />
                <em className="text-[#B5451B]">behind the blooms.</em>
              </h2>
              <p className="font-body text-[#2A1F1A]/70 text-base leading-relaxed mb-4">
                I grew up in Oklahoma, which means I grew up with red dirt on my boots and a healthy respect for what this land can produce when you treat it right. I started Red Dirt Blooms because I was tired of buying flowers that had been shipped from South America, sprayed with chemicals, and sitting in a box for three days before they ever hit a vase.
              </p>
              <p className="font-body text-[#2A1F1A]/70 text-base leading-relaxed mb-4">
                Oklahoma can grow extraordinary flowers. Our climate is challenging — the heat, the wind, the unpredictable spring storms — but those challenges produce flowers with character. They're tougher, more vibrant, and they last longer because they've had to work for it.
              </p>
              <p className="font-body text-[#2A1F1A]/70 text-base leading-relaxed">
                Every video I post, every email I send, every bouquet I cut — it's all part of the same story. A story about what's possible when you grow something with care, in the right soil, without shortcuts.
              </p>
            </div>
            <div className="relative">
              <img
                src={FARMER_IMG}
                alt="The farmer at Red Dirt Blooms"
                className="w-full rounded object-cover"
                style={{ maxHeight: "560px", objectPosition: "center" }}
              />
              <div className="absolute -bottom-4 -left-4 bg-[#E8A020] text-[#2A1F1A] px-5 py-3 rounded shadow-lg">
                <div className="font-accent text-lg font-semibold">Oklahoma Grown</div>
                <div className="font-body text-xs">Since the first seed hit the red dirt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Red Dirt Philosophy */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="font-accent text-[#B5451B] text-xl mb-3">Our Values</div>
            <h2 className="font-heading text-[#2A1F1A] font-bold mb-4" style={{ fontSize: "2.5rem" }}>
              The Red Dirt Philosophy
            </h2>
            <p className="font-body text-[#2A1F1A]/60 text-base leading-relaxed">
              Three principles that guide every decision on this farm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-6 h-6" />,
                title: "Organic, Always",
                body: "No pesticides. No synthetic fertilizers. No exceptions. When you bring our flowers into your home, you're bringing in something clean. The chemicals that get sprayed on conventional flowers stay in the stems — and you breathe them. We'll never do that to you.",
              },
              {
                icon: <Sun className="w-6 h-6" />,
                title: "Oklahoma Local",
                body: "Every flower we sell was grown in Oklahoma soil, under Oklahoma sun, by an Oklahoman who cares about this community. We don't import. We don't outsource. When you buy from us, your money stays in the state.",
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: "No Shortcuts",
                body: "Growing flowers organically takes longer. It's harder. It requires more attention. But the result is a flower that's genuinely better — more vibrant, longer-lasting, and grown with intention. We think that's worth it. We think you're worth it.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded border border-[#B5451B]/10 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-[#B5451B]/10 flex items-center justify-center mx-auto mb-4 text-[#B5451B]">
                  {item.icon}
                </div>
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-xl mb-3">{item.title}</h3>
                <p className="font-body text-[#2A1F1A]/60 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Land */}
      <section className="py-20 bg-[#2A1F1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-accent text-[#E8A020] text-xl mb-3">The Land</div>
              <h2 className="font-heading text-[#F5F0E8] font-bold mb-5" style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
                Oklahoma's Red Dirt<br />
                <em className="text-[#E8A020]">is the Secret.</em>
              </h2>
              <p className="font-body text-[#F5F0E8]/70 text-base leading-relaxed mb-4">
                Oklahoma's Port Silt Loam — the deep, iron-rich red soil that gives the state its distinctive color — is genuinely special growing medium. The iron content creates a mineral-rich environment that produces flowers with longer vase life and more vibrant colors than you'll find anywhere else.
              </p>
              <p className="font-body text-[#F5F0E8]/70 text-base leading-relaxed mb-4">
                The Oklahoma climate is challenging. The summer heat is intense. The spring storms are dramatic. The wind never really stops. But these challenges produce flowers with character — they're tougher, more resilient, and more beautiful for having had to earn their bloom.
              </p>
              <div className="flex gap-6 mt-6">
                {[
                  { icon: <Droplets className="w-5 h-5" />, label: "Iron-Rich Soil" },
                  { icon: <Sun className="w-5 h-5" />, label: "Full Oklahoma Sun" },
                  { icon: <Leaf className="w-5 h-5" />, label: "Zone 7a–7b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[#E8A020]">
                    {item.icon}
                    <span className="font-body text-sm text-[#F5F0E8]/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src={BOUQUET_IMG} alt="Oklahoma flowers" className="w-full rounded object-cover" style={{ maxHeight: "480px" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Varieties We Grow */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="font-accent text-[#B5451B] text-xl mb-2">What We Grow</div>
            <h2 className="font-heading text-[#2A1F1A] font-bold" style={{ fontSize: "2.25rem" }}>
              The Flowers We Grow
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {VARIETIES_GROWN.map((v) => (
              <div key={v.name} className="text-center group">
                <div className="aspect-square overflow-hidden rounded mb-2">
                  <img src={v.img} alt={v.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-base">{v.name}</h3>
                <p className="font-body text-[#2A1F1A]/50 text-xs">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
