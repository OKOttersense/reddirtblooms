/**
 * Red Dirt Blooms — The Bloom Diary (Video Feed)
 * A running documentary of the growing season.
 * Masonry-style grid of video entries with AI-generated summaries.
 */
import { useState } from "react";
import { Play, Calendar, Tag, Filter } from "lucide-react";
import { toast } from "sonner";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/bloom-diary-6ogmYoPwmfDbMqCafamNte.webp";
const BOUQUET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/harvest-bouquet-FabX3efg5cBChbv7p9NVxd.webp";
const HERO_FIELD = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/hero-field-KrvhZ4N7ENMFTq3Gm7ZLW5.webp";

const DIARY_ENTRIES = [
  {
    id: 1,
    date: "April 24, 2026",
    title: "Week 3 — The Dahlias Are Showing Their First Buds",
    summary: "Walked the rows this morning and spotted the first dahlia buds pushing through. The Café au Lait variety is about 3 weeks out from harvest. Red dirt is holding moisture well after last week's rain.",
    tags: ["Dahlia", "Update"],
    thumbnail: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
    isVideo: true,
    duration: "1:24",
  },
  {
    id: 2,
    date: "April 20, 2026",
    title: "Harvest Day — Zinnias Are Ready!",
    summary: "First full zinnia harvest of the season. Cut 200+ stems this morning before the Oklahoma heat set in. These are heading to the Harvest Stand today — grab them before they're gone.",
    tags: ["Zinnia", "Harvest"],
    thumbnail: BOUQUET_IMG,
    isVideo: true,
    duration: "2:08",
  },
  {
    id: 3,
    date: "April 15, 2026",
    title: "Meet This Week's Flower: Queen Lime Zinnia",
    summary: "A close-up look at the Queen Lime Zinnia — a rare, dusty green-and-burgundy variety you won't find at any grocery store. These take about 70 days from seed but are absolutely worth the wait.",
    tags: ["Zinnia", "Education"],
    thumbnail: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80",
    isVideo: false,
    duration: null,
  },
  {
    id: 4,
    date: "April 10, 2026",
    title: "Behind the Organic Process — Why No Chemicals, Ever",
    summary: "A quick walk-through of why we'll never use pesticides on this farm. The short version: chemicals stay in the stems. When you bring flowers into your home, you're breathing what was sprayed on them.",
    tags: ["Organic", "Education"],
    thumbnail: HERO_FIELD,
    isVideo: true,
    duration: "3:15",
  },
  {
    id: 5,
    date: "April 5, 2026",
    title: "Planting Day — 1,200 Seeds in the Ground",
    summary: "Big day on the farm. Got 1,200 seeds in the ground across 8 varieties. Zinnias, dahlias, sunflowers, lisianthus, celosia, amaranth, statice, and gomphrena. The red dirt is ready.",
    tags: ["Planting", "Update"],
    thumbnail: HERO_FIELD,
    isVideo: true,
    duration: "4:02",
  },
  {
    id: 6,
    date: "March 28, 2026",
    title: "The Soil Story — Oklahoma's Red Dirt Advantage",
    summary: "Oklahoma's Port Silt Loam is genuinely special. The iron content gives it that distinctive red color and also creates a mineral-rich environment that produces flowers with longer vase life and more vibrant colors.",
    tags: ["Education", "Oklahoma"],
    thumbnail: HERO_FIELD,
    isVideo: false,
    duration: null,
  },
];

const ALL_TAGS = ["All", "Zinnia", "Dahlia", "Sunflower", "Harvest", "Education", "Organic", "Oklahoma", "Planting", "Update"];

export default function BloomDiary() {
  const [activeTag, setActiveTag] = useState("All");
  const [email, setEmail] = useState("");

  const filtered = activeTag === "All"
    ? DIARY_ENTRIES
    : DIARY_ENTRIES.filter((e) => e.tags.includes(activeTag));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the Bloom Watch! We'll notify you of new diary entries. 🌸");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Bloom Diary"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A1F1A]/70 to-[#2A1F1A]/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">From the Field</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            The Bloom Diary
          </h1>
          <p className="font-body text-[#F5F0E8]/80 text-lg max-w-xl mx-auto">
            A running documentary of the growing season — from seed to harvest, straight from the red dirt.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#B5451B]/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-[#B5451B] flex-shrink-0" />
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTag === tag
                    ? "bg-[#B5451B] text-[#F5F0E8]"
                    : "bg-white border border-[#B5451B]/20 text-[#2A1F1A]/60 hover:border-[#B5451B] hover:text-[#B5451B]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diary Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded border border-[#B5451B]/10 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => toast.info("Video player coming soon! Subscribe to the Bloom Watch for updates.")}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={entry.thumbnail}
                    alt={entry.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {entry.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#B5451B]/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-[#F5F0E8] fill-[#F5F0E8] ml-0.5" />
                      </div>
                    </div>
                  )}
                  {entry.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white font-body text-xs px-1.5 py-0.5 rounded">
                      {entry.duration}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#B5451B]/50" />
                    <span className="font-body text-xs text-[#2A1F1A]/40">{entry.date}</span>
                  </div>
                  <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg leading-tight mb-2">
                    {entry.title}
                  </h3>
                  <p className="font-body text-[#2A1F1A]/60 text-sm leading-relaxed mb-3">
                    {entry.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                        className="inline-flex items-center gap-1 font-body text-xs text-[#7A8C6E] bg-[#7A8C6E]/10 hover:bg-[#7A8C6E]/20 px-2 py-0.5 rounded transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe Strip */}
      <section className="bg-[#2A1F1A] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-lg mb-2">Never Miss an Entry</div>
          <h2 className="font-heading text-[#F5F0E8] font-bold mb-3" style={{ fontSize: "1.75rem" }}>
            Get Bloom Diary Updates in Your Inbox
          </h2>
          <p className="font-body text-[#F5F0E8]/60 text-sm mb-6">
            New diary entries, harvest alerts, and behind-the-scenes farm updates — delivered straight to you.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-[#F5F0E8]/10 border border-[#F5F0E8]/20 rounded px-4 py-2.5 font-body text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-[#E8A020]"
              required
            />
            <button
              type="submit"
              className="bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold text-sm px-5 py-2.5 rounded transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
