/**
 * /florist-sample-cards
 * Printable design reference sample cards — one per variety.
 * Open in browser → Print → Save as PDF.
 * Features: filter chips by category, Coming Soon section, auto QR code.
 */

import { useState } from "react";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Variety {
  name: string;
  latin: string;
  category: string;
  categoryColor: string;
  colorBar: string;
  description: string;
  specs: { label: string; value: string }[];
  tags: { label: string; color: string }[];
  bestFor: string;
  bundle: string;
  photo?: string;
}

interface ComingSoon {
  name: string;
  latin: string;
  category: string;
  categoryColor: string;
  expectedSeason: string;
  description: string;
  tags: string[];
}

const VARIETIES: Variety[] = [
  {
    name: "White Yarrow",
    latin: "Achillea millefolium 'White'",
    category: "Filler",
    categoryColor: "#7A8C6E",
    colorBar: "linear-gradient(90deg,#F5F0E8,#E8E0D0,#D8D0C0)",
    description:
      "Flat-topped white clusters on sturdy stems. A workhorse filler with a soft, meadow-garden feel. Dries beautifully — retains shape and color for months.",
    specs: [
      { label: "Vase Life", value: "10–14 days" },
      { label: "Stem Length", value: "18–24 in" },
      { label: "Season", value: "Summer–Fall" },
      { label: "Fragrance", value: "Mild herbal" },
    ],
    tags: [
      { label: "Filler", color: "#7A8C6E" },
      { label: "Dried", color: "#9A7020" },
      { label: "Wedding", color: "#6B5E57" },
    ],
    bestFor: "Wildflower bouquets, dried arrangements, bridal greenery, texture in mixed designs",
    bundle: "10 stems",
  },
  {
    name: "Red Yarrow",
    latin: "Achillea millefolium 'Red'",
    category: "Filler",
    categoryColor: "#B5451B",
    colorBar: "linear-gradient(90deg,#B5451B,#C85A30,#D4704A)",
    description:
      "Same reliable form as white yarrow with a warm rust-red pop of color. Pairs beautifully with zinnias and celosias. Dries to a rich terracotta tone.",
    specs: [
      { label: "Vase Life", value: "10–14 days" },
      { label: "Stem Length", value: "18–24 in" },
      { label: "Season", value: "Summer–Fall" },
      { label: "Fragrance", value: "Mild herbal" },
    ],
    tags: [
      { label: "Filler", color: "#7A8C6E" },
      { label: "Dried", color: "#9A7020" },
      { label: "Warm Tones", color: "#B5451B" },
    ],
    bestFor: "Autumn arrangements, boho designs, dried wreaths, warm-palette mixed bouquets",
    bundle: "10 stems",
  },
  {
    name: "St. John's Wort",
    latin: "Hypericum perforatum",
    category: "Texture",
    categoryColor: "#9A7020",
    colorBar: "linear-gradient(90deg,#D4A853,#E8C060,#F0D080)",
    description:
      "Bright yellow star-shaped blooms that transition to ornamental berries. Highly sought by florists for its unusual texture and the berry stage that follows flowering.",
    specs: [
      { label: "Vase Life", value: "10–14 days" },
      { label: "Stem Length", value: "12–18 in" },
      { label: "Season", value: "Summer" },
      { label: "Berry Stage", value: "Yes — unique" },
    ],
    tags: [
      { label: "Filler", color: "#7A8C6E" },
      { label: "Dried", color: "#9A7020" },
      { label: "Texture", color: "#6B5E57" },
    ],
    bestFor: "Wildflower designs, texture-forward arrangements, berry-stage dried work, cottage garden style",
    bundle: "5 stems",
  },
  {
    name: "Verbena bonariensis",
    latin: "Verbena bonariensis",
    category: "Airy Filler",
    categoryColor: "#7A5C8C",
    colorBar: "linear-gradient(90deg,#7A5C8C,#9A70A8,#B088C0)",
    description:
      "Tall, airy stems topped with clusters of tiny purple flowers. Adds movement and lightness to any arrangement. Beloved by pollinators — a story your customers will love.",
    specs: [
      { label: "Vase Life", value: "7–10 days" },
      { label: "Stem Length", value: "24–36 in" },
      { label: "Season", value: "Summer–Fall" },
      { label: "Color", value: "Lavender-purple" },
    ],
    tags: [
      { label: "Filler", color: "#7A8C6E" },
      { label: "Airy", color: "#6B5E57" },
      { label: "Purple", color: "#7A5C8C" },
    ],
    bestFor: "Tall arrangements, wildflower designs, adding height and movement, garden-style bouquets",
    bundle: "10 stems",
  },
  {
    name: "Lamb's Ear",
    latin: "Stachys byzantina",
    category: "Foliage",
    categoryColor: "#5A7A50",
    colorBar: "linear-gradient(90deg,#B8C8B0,#C8D8C0,#D8E8D0)",
    description:
      "Soft, velvety, silver-gray foliage that florists consistently request for bridal work. The texture and color are unmatched by any other foliage. Bridal designers seek this out specifically.",
    specs: [
      { label: "Vase Life", value: "7–10 days" },
      { label: "Stem Length", value: "8–14 in" },
      { label: "Season", value: "Summer" },
      { label: "Texture", value: "Soft, velvety" },
    ],
    tags: [
      { label: "Foliage", color: "#5A7A50" },
      { label: "Wedding", color: "#6B5E57" },
      { label: "Bridal", color: "#6B5E57" },
    ],
    bestFor: "Bridal bouquets, wedding centerpieces, soft texture contrast, silver-toned designs",
    bundle: "5 stems",
  },
  {
    name: "Bee Balm",
    latin: "Monarda didyma",
    category: "Focal",
    categoryColor: "#B5451B",
    colorBar: "linear-gradient(90deg,#C84040,#D85050,#E86060)",
    description:
      "Shaggy, spidery blooms in bold red-pink. Strongly fragrant — fills a room. Unusual enough to be a conversation piece. Dries well and retains its distinctive form.",
    specs: [
      { label: "Vase Life", value: "7–10 days" },
      { label: "Stem Length", value: "18–24 in" },
      { label: "Season", value: "Summer" },
      { label: "Fragrance", value: "Strong, citrus-mint" },
    ],
    tags: [
      { label: "Focal", color: "#B5451B" },
      { label: "Fragrant", color: "#8A5A80" },
      { label: "Dried", color: "#9A7020" },
    ],
    bestFor: "Statement bouquets, fragrant arrangements, cottage garden style, dried floral work",
    bundle: "5 stems",
  },
  {
    name: "Gaura",
    latin: "Gaura lindheimeri",
    category: "Airy Filler",
    categoryColor: "#9A8880",
    colorBar: "linear-gradient(90deg,#F0E0E8,#F8EEF4,#FFF5FA)",
    description:
      "Delicate white-to-pink butterfly-like blooms on wiry stems. Adds an ethereal, floating quality to arrangements. Looks far more expensive than it is — a florist's secret weapon.",
    specs: [
      { label: "Vase Life", value: "7–10 days" },
      { label: "Stem Length", value: "18–30 in" },
      { label: "Season", value: "Summer–Fall" },
      { label: "Color", value: "White-blush pink" },
    ],
    tags: [
      { label: "Filler", color: "#7A8C6E" },
      { label: "Wedding", color: "#6B5E57" },
      { label: "Airy", color: "#6B5E57" },
    ],
    bestFor: "Bridal bouquets, airy garden designs, adding movement, romantic and whimsical styles",
    bundle: "10 stems",
  },
  {
    name: "Red Gomphrena",
    latin: "Gomphrena globosa 'Red'",
    category: "Dried",
    categoryColor: "#9A7020",
    colorBar: "linear-gradient(90deg,#C03040,#D04050,#E05060)",
    description:
      "Globe-shaped clover-like blooms in deep magenta-red. The undisputed champion of dried flowers — holds vibrant color for 12+ months. Fresh vase life is exceptional too.",
    specs: [
      { label: "Vase Life", value: "14+ days fresh" },
      { label: "Dried Life", value: "12+ months" },
      { label: "Season", value: "Summer–Fall" },
      { label: "Color Retention", value: "Excellent" },
    ],
    tags: [
      { label: "Dried", color: "#9A7020" },
      { label: "Filler", color: "#7A8C6E" },
      { label: "Long-Lasting", color: "#B5451B" },
    ],
    bestFor: "Dried wreaths, everlasting arrangements, fall designs, mixed fresh-dried bouquets, gifts",
    bundle: "10 stems",
  },
];

const COMING_SOON: ComingSoon[] = [
  {
    name: "Zinnia — Giant Pink",
    latin: "Zinnia elegans 'Giant Pink'",
    category: "Focal",
    categoryColor: "#C8507A",
    expectedSeason: "Summer 2025",
    description: "Large-headed zinnias in vibrant pink. Long stems, exceptional vase life, and bold color impact.",
    tags: ["Focal", "Wedding", "Color"],
  },
  {
    name: "Celosia — Pink Flamingo",
    latin: "Celosia argentea 'Pink Flamingo'",
    category: "Texture",
    categoryColor: "#D4607A",
    expectedSeason: "Summer 2025",
    description: "Feathery plume celosia in soft flamingo pink. Dries beautifully and holds color for months.",
    tags: ["Texture", "Dried", "Focal"],
  },
  {
    name: "Celosia — Forest Fire",
    latin: "Celosia argentea 'Forest Fire'",
    category: "Focal",
    categoryColor: "#C84020",
    expectedSeason: "Summer 2025",
    description: "Dramatic red-orange cockscomb with deep burgundy foliage. A showstopper in fall arrangements.",
    tags: ["Focal", "Dried", "Fall"],
  },
  {
    name: "Strawflower — Mixed",
    latin: "Xerochrysum bracteatum",
    category: "Dried",
    categoryColor: "#D4A020",
    expectedSeason: "Summer 2025",
    description: "Paper-textured blooms in a full spectrum of colors. The gold standard for dried floral work.",
    tags: ["Dried", "Long-Lasting", "Mixed Colors"],
  },
  {
    name: "Gomphrena — Audray Series",
    latin: "Gomphrena globosa 'Audray'",
    category: "Dried",
    categoryColor: "#9A5080",
    expectedSeason: "Summer 2025",
    description: "Larger-headed gomphrena in white, pink, and purple-red. Exceptional dried color retention.",
    tags: ["Dried", "Filler", "Long-Lasting"],
  },
  {
    name: "Marigold — Red Morphasis",
    latin: "Tagetes erecta 'Red Morphasis'",
    category: "Focal",
    categoryColor: "#B84020",
    expectedSeason: "Summer 2025",
    description: "Deep red-mahogany marigolds with a rich, velvety texture. Unusual color for a marigold.",
    tags: ["Focal", "Fall", "Warm Tones"],
  },
  {
    name: "Verbascum — Shades of Summer",
    latin: "Verbascum 'Shades of Summer'",
    category: "Airy Filler",
    categoryColor: "#C8A040",
    expectedSeason: "Summer 2025",
    description: "Tall spires of small flowers in warm yellow-apricot tones. Adds vertical drama and cottage charm.",
    tags: ["Filler", "Airy", "Cottage"],
  },
  {
    name: "Basil — Dark Opal Purple",
    latin: "Ocimum basilicum 'Dark Opal'",
    category: "Foliage",
    categoryColor: "#6A4080",
    expectedSeason: "Summer 2025",
    description: "Deep purple aromatic foliage and flower spikes. Fragrant, unusual, and stunning in mixed designs.",
    tags: ["Foliage", "Fragrant", "Unique"],
  },
];

const ALL_CATEGORIES = ["All", ...Array.from(new Set(VARIETIES.map((v) => v.category)))];

export default function FloristSampleCards() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? VARIETIES
      : VARIETIES.filter((v) => v.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex flex-col items-center py-6 gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#B5451B] text-[#F5F0E8] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#9A3A15] transition-colors"
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
          <a
            href="/florist-leave-behind"
            target="_blank"
            className="flex items-center gap-2 border border-[#B5451B] text-[#B5451B] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#B5451B10] transition-colors"
          >
            ← View Leave-Behind
          </a>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                activeFilter === cat
                  ? "bg-[#B5451B] text-[#F5F0E8] border-[#B5451B]"
                  : "bg-white text-[#6B5E57] border-[#E8D8C0] hover:border-[#B5451B] hover:text-[#B5451B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Page */}
      <div className="mx-auto" style={{ maxWidth: "8.5in", padding: "0 0.4in 0.4in" }}>
        <div className="text-center mb-6">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22pt", color: "#B5451B" }}>
            Red Dirt Blooms
          </h1>
          <p className="text-[9pt] text-[#9A8880] tracking-widest uppercase mt-1">
            Design Reference Sample Cards · Season 2025
          </p>
          {/* Print-only filter label */}
          {activeFilter !== "All" && (
            <p className="print:block hidden text-[8pt] text-[#B5451B] mt-1 font-semibold tracking-wider uppercase">
              Showing: {activeFilter}
            </p>
          )}
        </div>

        {/* ── Available Now Cards ── */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((v) => (
            <div
              key={v.name}
              className="bg-white border border-[#E8D8C0] rounded-lg overflow-hidden"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2 px-3.5 pt-3 pb-2">
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14pt", color: "#2A1F1A", lineHeight: 1.1 }}>
                    {v.name}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "8.5pt", color: "#9A8880", marginTop: "2px" }}>
                    {v.latin}
                  </div>
                </div>
                <span
                  className="text-[7pt] font-extrabold tracking-wider uppercase px-2 py-1 rounded-full shrink-0 mt-0.5"
                  style={{ background: v.categoryColor + "20", color: v.categoryColor }}
                >
                  {v.category}
                </span>
              </div>

              {/* Photo or placeholder */}
              {v.photo ? (
                <img
                  src={v.photo}
                  alt={v.name}
                  className="w-full object-cover border-y border-[#E8D8C0]"
                  style={{ height: "130px" }}
                />
              ) : (
                <div
                  className="w-full flex flex-col items-center justify-center gap-1.5 border-y border-[#E8D8C0] relative"
                  style={{ height: "130px", background: "#F5F0E8", color: "#C8C0B0" }}
                >
                  <div style={{ fontSize: "28pt", opacity: 0.25 }}>📷</div>
                  <div className="text-[7.5pt] tracking-wider uppercase opacity-50">Photo placeholder</div>
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: v.colorBar }} />
                </div>
              )}

              {/* Card body */}
              <div className="px-3.5 pt-2.5 pb-3">
                <p className="text-[8.5pt] text-[#4A3A30] leading-relaxed mb-2.5">{v.description}</p>

                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {v.specs.map((s) => (
                    <div key={s.label} className="bg-[#FAF7F2] rounded px-2 py-1">
                      <div className="text-[6.5pt] font-bold tracking-wider uppercase text-[#B5451B]">{s.label}</div>
                      <div className="text-[8.5pt] font-semibold text-[#2A1F1A] mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {v.tags.map((t) => (
                    <span
                      key={t.label}
                      className="text-[6.5pt] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                      style={{ background: t.color + "20", color: t.color }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>

                <div className="text-[8pt] text-[#6B5E57] leading-relaxed">
                  <span className="font-bold text-[7.5pt] tracking-wider uppercase text-[#2A1F1A]">Best For: </span>
                  {v.bestFor}
                </div>
              </div>

              <div className="bg-[#2A1F1A] text-[#C8C0B0] px-3.5 py-2 flex items-center justify-between text-[7.5pt]">
                <span>Bundle: <span className="font-semibold text-[#F5F0E8]">{v.bundle}</span></span>
                <span className="font-bold text-[#D4A853] text-[9pt]">Market Pricing</span>
                <span>reddirtblooms.ai</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Coming Soon Section ── */}
        {(activeFilter === "All") && (
          <div className="mt-10" style={{ pageBreakBefore: "always" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-[#E8D8C0]" />
              <div className="text-center">
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16pt", color: "#2A1F1A" }}>
                  Coming Soon
                </h2>
                <p className="text-[8.5pt] text-[#9A8880] tracking-widest uppercase mt-0.5">
                  Growing Now · Available Later This Season
                </p>
              </div>
              <div className="h-px flex-1 bg-[#E8D8C0]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {COMING_SOON.map((cs) => (
                <div
                  key={cs.name}
                  className="bg-white border border-dashed border-[#E8D8C0] rounded-lg overflow-hidden opacity-80"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <div className="flex items-start justify-between gap-2 px-3 pt-2.5 pb-2">
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "12pt", color: "#6B5E57", lineHeight: 1.1 }}>
                        {cs.name}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "8pt", color: "#B8B0A8", marginTop: "2px" }}>
                        {cs.latin}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className="text-[6.5pt] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full"
                        style={{ background: cs.categoryColor + "15", color: cs.categoryColor }}
                      >
                        {cs.category}
                      </span>
                      <span className="text-[6.5pt] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#D4A85320] text-[#9A7020]">
                        {cs.expectedSeason}
                      </span>
                    </div>
                  </div>

                  {/* Coming soon photo placeholder */}
                  <div
                    className="w-full flex flex-col items-center justify-center gap-1 border-y border-dashed border-[#E8D8C0]"
                    style={{ height: "70px", background: "#FAF7F2", color: "#D8D0C8" }}
                  >
                    <div className="text-[18pt] opacity-20">🌱</div>
                    <div className="text-[7pt] tracking-wider uppercase opacity-40">Growing now</div>
                  </div>

                  <div className="px-3 pt-2 pb-2.5">
                    <p className="text-[8pt] text-[#7A6E68] leading-relaxed mb-2">{cs.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {cs.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[6pt] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#F0EBE4] text-[#9A8880]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#F5F0E8] border-t border-dashed border-[#E8D8C0] px-3 py-1.5 text-[7pt] text-[#B8B0A8] text-center tracking-wider uppercase">
                    Pre-order inquiries welcome · hello@reddirtblooms.ai
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer with QR */}
        <div className="mt-6 flex items-center justify-between border-t border-[#E8D8C0] pt-4">
          <div className="text-[8pt] text-[#9A8880]">
            Red Dirt Blooms · Oklahoma City, OK<br />
            hello@reddirtblooms.ai · www.reddirtblooms.ai<br />
            <strong className="text-[#B5451B]">reddirtblooms.ai/pricing-sheet</strong> — live pricing
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-1.5 rounded border border-[#E8D8C0]">
              <QRCodeSVG
                value={`${window.location.origin}/pricing-sheet`}
                size={56}
                bgColor="#ffffff"
                fgColor="#2A1F1A"
                level="M"
              />
            </div>
            <div className="text-[6.5pt] text-[#9A8880] tracking-wider uppercase">Live Pricing</div>
          </div>
        </div>
      </div>

      <div className="print:hidden h-8" />
    </div>
  );
}
