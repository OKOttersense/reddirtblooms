/**
 * Seasonal Calendar — /seasonal-calendar
 * Interactive month-by-month availability chart for all 14 Oklahoma flower varieties
 * grown at Red Dirt Blooms. Color-coded by season band.
 * Prairie Modern design: warm earthy tones, Playfair Display headings.
 */

import { useState } from "react";
import { Link } from "wouter";
import { Flower2, Calendar, Info, Download } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Season = "spring" | "summer" | "fall" | "winter" | "dried";

interface Variety {
  name: string;
  season: Season;
  description: string;
  colors: string[];
  // 12-element array: 0 = not available, 1 = peak, 0.5 = limited/transitional
  availability: (0 | 0.5 | 1)[];
}

const VARIETIES: Variety[] = [
  {
    name: "Zinnias",
    season: "summer",
    description: "Oklahoma's workhorse bloom. Vibrant, long-lasting, and prolific from June through frost.",
    colors: ["Coral", "Salmon", "Hot Pink", "Orange", "White", "Bi-color"],
    availability: [0, 0, 0, 0, 0.5, 1, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Dahlias",
    season: "summer",
    description: "Show-stopping dinner plates and pompons. Peak season July–September.",
    colors: ["Deep Burgundy", "Peach", "Lavender", "White", "Coral"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Sunflowers",
    season: "summer",
    description: "Classic Oklahoma summer staple. Multiple flushes from June through September.",
    colors: ["Golden Yellow", "Chocolate Center", "Lemon", "Rust"],
    availability: [0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0, 0],
  },
  {
    name: "Lisianthus",
    season: "summer",
    description: "Elegant ruffled blooms resembling roses. Slow-growing but worth the wait.",
    colors: ["White", "Lavender", "Purple", "Blush Pink"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0],
  },
  {
    name: "Celosias",
    season: "summer",
    description: "Velvety plumes and cockscomb heads. Heat-lovers that thrive in Oklahoma summers.",
    colors: ["Magenta", "Orange", "Red", "Yellow", "Pink"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Statice",
    season: "summer",
    description: "Papery blooms that dry beautifully. Excellent filler and dried flower staple.",
    colors: ["Purple", "White", "Pink", "Lavender"],
    availability: [0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0, 0],
  },
  {
    name: "Strawflowers",
    season: "summer",
    description: "Crisp, papery petals that hold color perfectly when dried. Everlasting beauty.",
    colors: ["Red", "Orange", "Yellow", "Pink", "White"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Gomphrena",
    season: "summer",
    description: "Globe-shaped blooms that dry perfectly. Excellent heat tolerance.",
    colors: ["Magenta", "Purple", "White", "Pink", "Orange"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Amaranth",
    season: "summer",
    description: "Dramatic cascading plumes in deep jewel tones. Stunning focal or dried flower.",
    colors: ["Deep Burgundy", "Coral", "Green", "Bi-color"],
    availability: [0, 0, 0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0],
  },
  {
    name: "Larkspur",
    season: "spring",
    description: "Cool-season spires in shades of blue, purple, and pink. Spring's first gift.",
    colors: ["Blue", "Purple", "Pink", "White"],
    availability: [0, 0, 0, 0.5, 1, 0.5, 0, 0, 0, 0, 0, 0],
  },
  {
    name: "Snapdragons",
    season: "spring",
    description: "Tall, fragrant spires that thrive in Oklahoma's cool spring and fall windows.",
    colors: ["White", "Pink", "Coral", "Yellow", "Burgundy", "Bi-color"],
    availability: [0, 0, 0.5, 1, 1, 0, 0, 0, 0.5, 1, 0.5, 0],
  },
  {
    name: "Ranunculus",
    season: "spring",
    description: "Layered tissue-paper petals. Cool-season royalty grown in early spring.",
    colors: ["Blush", "White", "Coral", "Yellow", "Red"],
    availability: [0, 0, 0.5, 1, 0.5, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: "Anemones",
    season: "spring",
    description: "Jewel-bright poppy-like blooms with dark centers. Early spring treasures.",
    colors: ["Red", "Purple", "Pink", "White", "Blue"],
    availability: [0, 0.5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: "Dried Arrangements",
    season: "dried",
    description: "Everlasting bouquets from strawflowers, statice, gomphrena, and grasses. Available year-round.",
    colors: ["Natural", "Bleached", "Dyed"],
    availability: [1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1],
  },
];

const SEASON_CONFIG: Record<Season, { label: string; color: string; bg: string; border: string }> = {
  spring: { label: "Spring", color: "#7A8C6E", bg: "#7A8C6E20", border: "#7A8C6E40" },
  summer: { label: "Summer", color: "#B5451B", bg: "#B5451B18", border: "#B5451B40" },
  fall:   { label: "Fall",   color: "#D4A853", bg: "#D4A85318", border: "#D4A85340" },
  winter: { label: "Winter", color: "#5B8DD9", bg: "#5B8DD918", border: "#5B8DD940" },
  dried:  { label: "Year-Round", color: "#8B7355", bg: "#8B735518", border: "#8B735540" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function AvailabilityCell({ value, season }: { value: 0 | 0.5 | 1; season: Season }) {
  const { color } = SEASON_CONFIG[season];
  if (value === 0) return <div className="w-full h-7 rounded-sm" style={{ background: "#F5F0E8" }} />;
  if (value === 0.5) return (
    <div className="w-full h-7 rounded-sm flex items-center justify-center" style={{ background: `${color}30` }}>
      <div className="w-3 h-3 rounded-full" style={{ background: color, opacity: 0.6 }} />
    </div>
  );
  return <div className="w-full h-7 rounded-sm" style={{ background: color }} />;
}

function VarietyRow({ variety, isSelected, onClick }: { variety: Variety; isSelected: boolean; onClick: () => void }) {
  const cfg = SEASON_CONFIG[variety.season];
  return (
    <tr
      className="cursor-pointer transition-colors"
      style={{ background: isSelected ? cfg.bg : "transparent" }}
      onClick={onClick}
    >
      <td className="py-2 pr-4 pl-2 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
          <span className="text-sm font-medium" style={{ color: "#2A1F1A" }}>{variety.name}</span>
        </div>
      </td>
      {variety.availability.map((val, i) => (
        <td key={i} className="px-0.5 py-1.5" style={{ minWidth: "2.5rem" }}>
          <AvailabilityCell value={val} season={variety.season} />
        </td>
      ))}
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SeasonalCalendar() {
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [filterSeason, setFilterSeason] = useState<Season | "all">("all");

  const filtered = filterSeason === "all" ? VARIETIES : VARIETIES.filter((v) => v.season === filterSeason);

  const currentMonth = new Date().getMonth(); // 0-indexed

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: "#B5451B" }}>
            Red Dirt Blooms · Oklahoma City Metro
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2A1F1A" }}
          >
            Seasonal Availability Calendar
          </h1>
          <p className="text-base max-w-2xl" style={{ color: "#5A4A3A" }}>
            A month-by-month guide to what's growing at our OKC Metro farm. Plan your events,
            wholesale orders, and CSA subscriptions around peak bloom windows.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {(["all", "spring", "summer", "fall", "dried"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeason(s)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={{
                  background: filterSeason === s ? (s === "all" ? "#2A1F1A" : SEASON_CONFIG[s].color) : "transparent",
                  color: filterSeason === s ? "#F5F0E8" : (s === "all" ? "#2A1F1A" : SEASON_CONFIG[s].color),
                  borderColor: s === "all" ? "#2A1F1A" : SEASON_CONFIG[s].color,
                }}
              >
                {s === "all" ? "All Varieties" : SEASON_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="overflow-x-auto rounded-xl shadow-sm" style={{ background: "#FFFFFF", border: "1px solid #E8E0D0" }}>
            <table className="w-full border-collapse" style={{ minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8E0D0" }}>
                  <th className="py-3 pr-4 pl-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B7355", minWidth: "160px" }}>
                    Variety
                  </th>
                  {MONTHS.map((m, i) => (
                    <th
                      key={m}
                      className="py-3 px-0.5 text-center text-xs font-semibold"
                      style={{
                        color: i === currentMonth ? "#B5451B" : "#8B7355",
                        minWidth: "2.5rem",
                        borderBottom: i === currentMonth ? "2px solid #B5451B" : undefined,
                      }}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((variety) => (
                  <VarietyRow
                    key={variety.name}
                    variety={variety}
                    isSelected={selectedVariety?.name === variety.name}
                    onClick={() => setSelectedVariety(selectedVariety?.name === variety.name ? null : variety)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 mt-5 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 rounded-sm" style={{ background: "#B5451B" }} />
              <span className="text-xs" style={{ color: "#5A4A3A" }}>Peak availability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 rounded-sm flex items-center justify-center" style={{ background: "#B5451B30" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#B5451B", opacity: 0.6 }} />
              </div>
              <span className="text-xs" style={{ color: "#5A4A3A" }}>Limited / transitional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 rounded-sm" style={{ background: "#F5F0E8", border: "1px solid #E8E0D0" }} />
              <span className="text-xs" style={{ color: "#5A4A3A" }}>Not available</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "#8B7355" }}>
              <Info size={13} />
              <span>Click any row for variety details</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Variety Detail Panel */}
      {selectedVariety && (
        <section className="px-4 pb-10">
          <div className="max-w-5xl mx-auto rounded-xl p-6" style={{ background: SEASON_CONFIG[selectedVariety.season].bg, border: `1px solid ${SEASON_CONFIG[selectedVariety.season].border}` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: SEASON_CONFIG[selectedVariety.season].color, color: "#F5F0E8" }}
                  >
                    {SEASON_CONFIG[selectedVariety.season].label}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mt-2" style={{ fontFamily: "'Playfair Display', serif", color: "#2A1F1A" }}>
                  {selectedVariety.name}
                </h2>
                <p className="mt-2 text-sm max-w-xl" style={{ color: "#5A4A3A" }}>{selectedVariety.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedVariety.colors.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#FFFFFF80", color: "#2A1F1A", border: "1px solid #E8E0D0" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedVariety(null)}
                className="text-xs flex-shrink-0 mt-1"
                style={{ color: "#8B7355" }}
              >
                Close ✕
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Season Bands Overview */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: "#2A1F1A" }}>
            Oklahoma Growing Seasons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["spring", "summer", "fall", "dried"] as Season[]).map((s) => {
              const cfg = SEASON_CONFIG[s];
              const varieties = VARIETIES.filter((v) => v.season === s);
              return (
                <div
                  key={s}
                  className="rounded-xl p-5 cursor-pointer transition-all"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  onClick={() => setFilterSeason(filterSeason === s ? "all" : s)}
                >
                  <div className="w-3 h-3 rounded-full mb-3" style={{ background: cfg.color }} />
                  <h3 className="font-semibold text-base mb-1" style={{ color: "#2A1F1A" }}>{cfg.label}</h3>
                  <p className="text-xs mb-3" style={{ color: "#8B7355" }}>
                    {s === "spring" && "March – May"}
                    {s === "summer" && "June – October"}
                    {s === "fall" && "September – November"}
                    {s === "dried" && "Year-round"}
                  </p>
                  <div className="space-y-1">
                    {varieties.map((v) => (
                      <p key={v.name} className="text-xs" style={{ color: "#5A4A3A" }}>· {v.name}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-14 px-4" style={{ background: "#2A1F1A" }}>
        <div className="max-w-3xl mx-auto text-center">
          <Flower2 className="w-8 h-8 mx-auto mb-4" style={{ color: "#D4A853" }} />
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#F5F0E8" }}>
            Ready to Plan Around the Harvest?
          </h2>
          <p className="text-sm mb-6" style={{ color: "#C8C0B0" }}>
            Wholesale florists can order direct from our weekly harvest board. CSA subscribers get
            guaranteed bouquets throughout the season. Events can be planned around peak bloom windows.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/florist-register">
              <button className="px-6 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: "#B5451B", color: "#F5F0E8" }}>
                Apply for Wholesale Access
              </button>
            </Link>
            <Link href="/csa">
              <button className="px-6 py-3 rounded font-semibold text-sm border transition-opacity hover:opacity-80" style={{ borderColor: "#D4A853", color: "#D4A853", background: "transparent" }}>
                View CSA Subscriptions
              </button>
            </Link>
            <Link href="/bouquet-bar">
              <button className="px-6 py-3 rounded font-semibold text-sm border transition-opacity hover:opacity-80" style={{ borderColor: "#C8C0B0", color: "#C8C0B0", background: "transparent" }}>
                Plan an Event
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
