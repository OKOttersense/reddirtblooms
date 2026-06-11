import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Leaf, Sun, Droplets } from "lucide-react";

// ─── Sample Week Data ─────────────────────────────────────────────────────────
const SAMPLE_WEEKS = [
  {
    week: 1,
    date: "Week of June 16",
    title: "Opening Day Bouquet",
    tagline: "The first cut of the season — zinnias at their most electric.",
    palette: ["#E8523A", "#F4A261", "#FBBF24", "#84CC16"],
    paletteNames: ["Coral Zinnia", "Peach Zinnia", "Gold Marigold", "Lime Basil"],
    stems: [
      { name: "Coral Zinnias", count: "5–7 stems", note: "Peak summer color" },
      { name: "Sunflower", count: "1–2 stems", note: "Dwarf variety, vase-ready" },
      { name: "Lemon Basil", count: "3 stems", note: "Fragrant filler" },
      { name: "Celosia", count: "2–3 stems", note: "Velvet texture" },
    ],
    vaseLife: "10–12 days",
    mood: "Bright & Joyful",
    img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80",
    tip: "Trim stems at a 45° angle and change water every 2 days. Keep away from direct sunlight.",
  },
  {
    week: 4,
    date: "Week of July 7",
    title: "High Summer Harvest",
    tagline: "Dahlias arrive. The farm is in full swing.",
    palette: ["#BE185D", "#DB2777", "#F472B6", "#FDE68A"],
    paletteNames: ["Café au Lait Dahlia", "Magenta Dahlia", "Blush Lisianthus", "Cream Marigold"],
    stems: [
      { name: "Café au Lait Dahlias", count: "2–3 blooms", note: "Dinner-plate size" },
      { name: "Lisianthus", count: "3–4 stems", note: "Ruffled, rose-like" },
      { name: "Strawflowers", count: "4–5 stems", note: "Papery, long-lasting" },
      { name: "Gomphrena", count: "5–6 stems", note: "Globe-shaped filler" },
    ],
    vaseLife: "12–14 days",
    mood: "Romantic & Lush",
    img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
    tip: "Dahlias are thirsty — check water daily. Remove any leaves below the waterline.",
  },
  {
    week: 8,
    date: "Week of August 4",
    title: "Late Summer Abundance",
    tagline: "Amaranth and rudbeckia join the harvest. Colors deepen.",
    palette: ["#7C3AED", "#A78BFA", "#F59E0B", "#10B981"],
    paletteNames: ["Purple Amaranth", "Lavender Statice", "Rudbeckia Gold", "Eucalyptus"],
    stems: [
      { name: "Amaranth", count: "2–3 stems", note: "Cascading burgundy tassels" },
      { name: "Rudbeckia", count: "5–7 stems", note: "Black-eyed Susan family" },
      { name: "Statice", count: "3–4 stems", note: "Dries beautifully in-vase" },
      { name: "Eucalyptus", count: "2–3 stems", note: "Silver-green texture" },
    ],
    vaseLife: "14–16 days",
    mood: "Earthy & Textured",
    img: "https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=600&q=80",
    tip: "Statice and amaranth will dry in the vase — you can keep them as a dried arrangement afterward.",
  },
  {
    week: 12,
    date: "Week of September 1",
    title: "The Fall Transition",
    tagline: "Cooler nights bring deeper colors. Dahlias hit their peak.",
    palette: ["#92400E", "#B45309", "#D97706", "#78350F"],
    paletteNames: ["Terracotta Dahlia", "Amber Zinnia", "Burnt Orange Celosia", "Chocolate Cosmos"],
    stems: [
      { name: "Terracotta Dahlias", count: "3–4 blooms", note: "Fall palette perfection" },
      { name: "Chocolate Cosmos", count: "4–5 stems", note: "Rare — smells like vanilla" },
      { name: "Celosia", count: "3–4 stems", note: "Feathery plume variety" },
      { name: "Dried Strawflowers", count: "5–6 stems", note: "Already drying on the stem" },
    ],
    vaseLife: "10–14 days",
    mood: "Warm & Autumnal",
    img: "https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=600&q=80",
    tip: "Chocolate cosmos are rare and short-lived — enjoy them for 5–7 days, then let the rest of the bouquet carry on.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SampleWeekDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const active = SAMPLE_WEEKS[activeIdx];

  const go = (dir: "prev" | "next") => {
    if (animating) return;
    setDirection(dir === "next" ? "right" : "left");
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx((i) =>
        dir === "next"
          ? (i + 1) % SAMPLE_WEEKS.length
          : (i - 1 + SAMPLE_WEEKS.length) % SAMPLE_WEEKS.length
      );
      setAnimating(false);
    }, 220);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    const t = setInterval(() => go("next"), 6000);
    return () => clearInterval(t);
  }, [activeIdx]);

  return (
    <section className="py-20 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs tracking-widest uppercase"
            style={{ background: "rgba(212,168,83,0.12)", color: "#D4A853", border: "1px solid rgba(212,168,83,0.25)" }}
          >
            <Leaf className="w-3 h-3" />
            Live Demo — What You'll Receive
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: "#F5EFE6" }}
          >
            A Peek Inside Your Share
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "rgba(245,239,230,0.55)" }}>
            Every week is different. Below is an illustrative preview of what a typical share looks like as the season progresses from June through September — varieties, palettes, and vase-life notes based on what we grow.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 justify-center mb-8">
          {SAMPLE_WEEKS.map((w, i) => (
            <button
              key={w.week}
              onClick={() => { setActiveIdx(i); }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeIdx ? "2.5rem" : "0.75rem",
                background: i === activeIdx ? "#D4A853" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === "right" ? "-20px" : "20px"})`
              : "translateX(0)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          <div className="grid md:grid-cols-2">
            {/* Image side */}
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img
                src={active.img}
                alt={active.title}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.85)" }}
              />
              {/* Week badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(15,10,6,0.85)", color: "#D4A853", border: "1px solid rgba(212,168,83,0.4)" }}
              >
                Week {active.week} · {active.date}
              </div>
              {/* Mood badge */}
              <div
                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(15,10,6,0.75)", color: "rgba(245,239,230,0.8)" }}
              >
                {active.mood}
              </div>
            </div>

            {/* Info side */}
            <div className="p-8">
              <h3
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: "#F5EFE6" }}
              >
                {active.title}
              </h3>
              <p className="text-sm mb-5 italic" style={{ color: "rgba(245,239,230,0.55)" }}>
                {active.tagline}
              </p>

              {/* Color palette */}
              <div className="mb-5">
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(245,239,230,0.35)" }}>
                  This Week's Palette
                </div>
                <div className="flex gap-2 flex-wrap">
                  {active.palette.map((color, i) => (
                    <div key={color} className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                      />
                      <span className="text-xs" style={{ color: "rgba(245,239,230,0.5)" }}>
                        {active.paletteNames[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stem list */}
              <div className="mb-5">
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(245,239,230,0.35)" }}>
                  What's in the Bouquet
                </div>
                <div className="space-y-2">
                  {active.stems.map((stem) => (
                    <div key={stem.name} className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#F5EFE6" }}>{stem.name}</span>
                        <span className="text-xs ml-2" style={{ color: "rgba(245,239,230,0.4)" }}>{stem.note}</span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "rgba(212,168,83,0.7)" }}>{stem.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" style={{ color: "#5D8A5E" }} />
                  <span className="text-xs" style={{ color: "rgba(245,239,230,0.55)" }}>
                    Vase life: <strong style={{ color: "#F5EFE6" }}>{active.vaseLife}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" style={{ color: "#D4A853" }} />
                  <span className="text-xs" style={{ color: "rgba(245,239,230,0.55)" }}>
                    Cut same morning
                  </span>
                </div>
              </div>

              {/* Care tip */}
              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: "rgba(93,138,94,0.1)", border: "1px solid rgba(93,138,94,0.2)", color: "rgba(245,239,230,0.65)" }}
              >
                <span style={{ color: "#5D8A5E", fontWeight: 600 }}>Care tip: </span>
                {active.tip}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => go("prev")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:opacity-80"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(245,239,230,0.6)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous week
          </button>
          <span className="text-xs" style={{ color: "rgba(245,239,230,0.3)" }}>
            {activeIdx + 1} of {SAMPLE_WEEKS.length} sample weeks
          </span>
          <button
            onClick={() => go("next")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hover:opacity-80"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(245,239,230,0.6)" }}
          >
            Next week
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CTA nudge */}
        <p className="text-center text-xs mt-8" style={{ color: "rgba(245,239,230,0.35)" }}>
          Illustrative preview — actual varieties depend on what’s at peak bloom on your pickup week.{" "}
          <a href="#tiers" className="underline" style={{ color: "rgba(212,168,83,0.6)" }}>
            Reserve your share →
          </a>
        </p>
      </div>
    </section>
  );
}
