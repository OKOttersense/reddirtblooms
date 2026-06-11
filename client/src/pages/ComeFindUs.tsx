/**
 * Red Dirt Blooms — Find Us (Contact & Ordering)
 * Micro farm on private residential property — no farm visits.
 * Central pickup hub to be announced. Delivery available when possible.
 */
import { useState } from "react";
import { Truck, Mail, ChevronDown, ChevronUp, ShoppingBag, AlertTriangle, Globe, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

const FAQS = [
  {
    q: "Can I visit the farm?",
    a: "Not at this time. Red Dirt Blooms is a micro farm operating on private residential property in a Norman neighborhood. We are not open to the public — no U-pick, no drop-in tours, no on-site shopping. All ordering is done online through this website. We appreciate your understanding and look forward to finding a permanent farm home in the future.",
  },
  {
    q: "Where do I pick up my order?",
    a: "We are working on establishing a central pickup hub in the OKC metro area — details will be announced before the season opens. Once confirmed, pickup location and hours will be posted here and emailed to all Bloom Watch subscribers. Sign up below to be the first to know.",
  },
  {
    q: "Do you offer delivery?",
    a: "Yes, when possible! We deliver to the OKC metro area — Norman, Oklahoma City, Edmond, Moore, Yukon, Mustang, and surrounding communities. Delivery availability depends on order volume and harvest day logistics. A small delivery fee applies based on distance.",
  },
  {
    q: "How do I place an order?",
    a: "All orders are placed online through the Harvest Stand on this website. After your order is confirmed, we'll reach out to coordinate your pickup or delivery window. We do not accept walk-up orders or phone orders.",
  },
  {
    q: "Is the farm location permanent?",
    a: "No. We're currently growing in a residential backyard in Norman while we work toward securing a dedicated farm space. The central pickup hub will be a separate, public-friendly location. When we find our permanent farm home, you'll be the first to know.",
  },
  {
    q: "How do I know when flowers are ready?",
    a: "Sign up for Bloom Watch! We'll send you an email the moment a variety is ready to harvest. You can also check 'In the Ground' on the website for live growth stage updates on every variety we're growing this season.",
  },
  {
    q: "Are all flowers organically grown?",
    a: "Yes. No pesticides, no synthetic fertilizers, no chemicals of any kind. Every flower is grown organically from seed to cut. That's a promise we'll never break.",
  },
  {
    q: "How long will my bouquet last?",
    a: "With proper care, most of our bouquets last 7–10 days. Trim stems at a 45° angle, change the water every 2 days, and keep them away from direct sunlight and heat vents. Conditioning flowers in a cool room overnight before arranging also extends vase life significantly.",
  },
  {
    q: "Can I order for a special event or wedding?",
    a: "Yes! For events and weddings, please reach out via the contact form at least 4–6 weeks in advance so we can plan the harvest around your date. We love being part of Oklahoma celebrations. We also offer Bouquet Bar — a custom arrangement inquiry service for special occasions.",
  },
  {
    q: "Do you offer wholesale for florists?",
    a: "We do! Visit our Florist Portal to apply for our weekly wholesale availability list. We sell in 10-stem bunches at wholesale pricing to approved florists. Availability is announced each week and goes fast — approved florists get first access.",
  },
  {
    q: "Do you ship flowers?",
    a: "No — and that's intentional. Flowers that travel in boxes for days lose their freshness and vitality. We only serve the OKC metro area so we can deliver at peak quality, the same day or next day after harvest.",
  },
  {
    q: "How many varieties do you grow?",
    a: "We grow dozens of varieties each season, starting approximately 120 seeds per variety to ensure we can offer a wide range of colors, textures, and bloom types. This scale lets us grow specialty varieties you won't find at grocery stores — things like Strawflower, Gomphrena, Celosia, and heirloom Zinnias. Check 'In the Ground' to see everything currently growing.",
  },
  {
    q: "What is Bloom Watch?",
    a: "Bloom Watch is our free email list for people who want to know the moment a variety is ready to harvest. We send a quick note with what's available, how many bunches are left, and how to order. It's the best way to get first access before we sell out. Sign up at the bottom of this page or on the homepage.",
  },
  {
    q: "What is the CSA / Bloom Box subscription?",
    a: "Our Bloom Box is a recurring subscription where we deliver a curated bouquet of whatever is at peak harvest each week. You don't choose the varieties — you get what's best right now, straight from the field. It's the freshest way to experience the full range of what we grow. Available in 4-week and 8-week subscriptions.",
  },
  {
    q: "How do you decide what to grow each season?",
    a: "We start seeds in batches of approximately 120 per variety, which gives us enough plants to produce meaningful quantities while still growing a wide range of specialty types. Variety selection is based on what performs well in Oklahoma's climate, what florists and customers are requesting, and what we find beautiful. We document every variety's journey on the Bloom Diary so you can follow along.",
  },
  {
    q: "Can I follow along with the farm?",
    a: "Absolutely. The Bloom Diary is our running journal of what's happening on the farm — from seed starting and transplanting to first blooms and harvest days. 'In the Ground' shows the real-time status of every variety we're growing. We believe in radical transparency about where your flowers come from.",
  },
];

const DELIVERY_CITIES = [
  "Norman", "Oklahoma City", "Edmond", "Moore",
  "Yukon", "Mustang", "Choctaw", "Midwest City",
  "Del City", "Bethany", "Warr Acres", "The Village",
];

export default function ComeFindUs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Header */}
      <section className="bg-[#2A1F1A] py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">Online Orders · Local Delivery · Pickup Hub Coming Soon</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-3" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            Find Us
          </h1>
          <p className="font-body text-[#F5F0E8]/60 text-base max-w-xl mx-auto">
            Red Dirt Blooms is a micro farm growing in a Norman neighborhood. All ordering is online — we'll bring the flowers to you, or meet you at our upcoming pickup hub.
          </p>
        </div>
      </section>

      {/* Private Property Notice */}
      <section className="py-8 bg-[#B5451B]/5 border-b border-[#B5451B]/15">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B5451B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-[#B5451B]" />
            </div>
            <div>
              <h2 className="font-heading text-[#2A1F1A] font-semibold text-lg mb-1">Private Property — No Farm Visits</h2>
              <p className="font-body text-[#2A1F1A]/70 text-sm leading-relaxed">
                Red Dirt Blooms currently operates from a private residential property in Norman, Oklahoma. We are <strong>not open to the public</strong> — no farm tours, no U-pick, no drop-in visits. All orders are placed online and fulfilled through local delivery or our upcoming central pickup hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Globe className="w-5 h-5" />,
                title: "Order Online",
                lines: [
                  "All orders placed through this website",
                  "Visit the Harvest Stand to shop",
                  "No walk-in or phone orders",
                ],
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                title: "Pickup Hub — Coming Soon",
                lines: [
                  "Central OKC metro location",
                  "Details announced before season opens",
                  "Sign up for Bloom Watch to be notified",
                ],
                highlight: true,
              },
              {
                icon: <Truck className="w-5 h-5" />,
                title: "Local Delivery",
                lines: [
                  "OKC metro area — when available",
                  "Depends on order volume & harvest day",
                  "Small delivery fee based on distance",
                ],
              },
              {
                icon: <MessageCircle className="w-5 h-5" />,
                title: "Questions?",
                lines: [
                  "Use the contact form below",
                  "hello@reddirtblooms.ai",
                  "Response within 24 hours",
                ],
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`p-6 rounded border hover:shadow-md transition-shadow ${
                  (card as { highlight?: boolean }).highlight
                    ? "border-[#E8A020]/40 bg-[#E8A020]/5"
                    : "border-[#B5451B]/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  (card as { highlight?: boolean }).highlight
                    ? "bg-[#E8A020]/20 text-[#E8A020]"
                    : "bg-[#B5451B]/10 text-[#B5451B]"
                }`}>
                  {card.icon}
                </div>
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg mb-2">{card.title}</h3>
                {card.lines.map((line, i) => (
                  <p key={i} className="font-body text-[#2A1F1A]/60 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickup Hub Announcement Banner */}
      <section className="py-10 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-[#2A1F1A] rounded-lg p-6 text-center">
            <div className="font-accent text-[#E8A020] text-base mb-2">Coming This Season</div>
            <h2 className="font-heading text-[#F5F0E8] font-bold text-2xl mb-3">
              Central Pickup Hub — To Be Announced
            </h2>
            <p className="font-body text-[#F5F0E8]/70 text-sm leading-relaxed max-w-xl mx-auto mb-4">
              We're working on securing a convenient, public-friendly pickup location in the OKC metro area. Once confirmed, all Bloom Watch subscribers will be the first to know the address, hours, and how to schedule your pickup. Until then, local delivery is available when order volume allows.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#E8A020]/15 border border-[#E8A020]/30 rounded px-4 py-2">
              <MapPin className="w-4 h-4 text-[#E8A020]" />
              <span className="font-body text-[#E8A020] text-sm font-semibold">OKC Metro Area · Details Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form + Delivery Area */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="font-accent text-[#B5451B] text-lg mb-2">Send a Message</div>
              <h2 className="font-heading text-[#2A1F1A] font-bold mb-6" style={{ fontSize: "2rem" }}>
                Let's Talk Flowers
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@email.com"
                      className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                    required
                  >
                    <option value="">Select a subject...</option>
                    <option>Order Question</option>
                    <option>Pickup Hub Question</option>
                    <option>Delivery Question</option>
                    <option>Event / Wedding Inquiry</option>
                    <option>Wholesale / Florist</option>
                    <option>General Question</option>
                    <option>Just Saying Hey!</option>
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-[#2A1F1A]/60 block mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    className="w-full bg-[#F5F0E8] border border-[#B5451B]/20 rounded px-3 py-2.5 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B] resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Delivery Area */}
            <div>
              <div className="font-accent text-[#B5451B] text-lg mb-2">Where We Deliver</div>
              <h2 className="font-heading text-[#2A1F1A] font-bold mb-4" style={{ fontSize: "2rem" }}>
                OKC Metro Service Area
              </h2>
              <p className="font-body text-[#2A1F1A]/60 text-sm mb-6 leading-relaxed">
                We deliver locally to keep our flowers as fresh as possible. Delivery is available when order volume and harvest day logistics allow — same-day or next-day only, no boxes, no shipping.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {DELIVERY_CITIES.map((city) => (
                  <div key={city} className="flex items-center gap-2 bg-[#F5F0E8] rounded px-3 py-2 border border-[#B5451B]/10">
                    <Truck className="w-3.5 h-3.5 text-[#B5451B] flex-shrink-0" />
                    <span className="font-body text-sm text-[#2A1F1A]/70">{city}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#B5451B]/5 border border-[#B5451B]/20 rounded p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-[#B5451B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm font-semibold text-[#2A1F1A] mb-1">Not on the list?</p>
                    <p className="font-body text-xs text-[#2A1F1A]/60 leading-relaxed">
                      Send us a message! If you're within reasonable distance of the OKC metro, we'll do our best to make it work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="font-accent text-[#B5451B] text-lg mb-2">Common Questions</div>
            <h2 className="font-heading text-[#2A1F1A] font-bold" style={{ fontSize: "2.25rem" }}>
              FAQ
            </h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-[#B5451B]/10 rounded overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#F5F0E8] transition-colors"
                >
                  <span className="font-body text-sm font-semibold text-[#2A1F1A] pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[#B5451B] flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#2A1F1A]/40 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 bg-white">
                    <p className="font-body text-sm text-[#2A1F1A]/60 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
