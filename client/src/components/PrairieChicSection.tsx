import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const PRAIRIE_CHIC_IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/prairie-chic-hero-LtPwDPp3wmH8Qg2d3wMjnz.webp",
  detail: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/prairie-chic-detail-n26ZYhX5RAgPuv3a6Tm2yu.webp",
  lifestyle: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/prairie-chic-lifestyle-dHYt3X6mF83WaKgJUWhKuh.webp",
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function PrairieChicSection() {
  const { ref: headRef, inView: headIn } = useInView(0.1);
  const { ref: gridRef, inView: gridIn } = useInView(0.1);
  const { ref: pillarsRef, inView: pillarsIn } = useInView(0.1);

  const pillars = [
    {
      icon: "🌾",
      label: "Grown in Red Dirt",
      desc: "Every stem starts in Oklahoma's iron-rich soil — the same earth that shaped this land for centuries.",
    },
    {
      icon: "✂️",
      label: "Cut at Peak Bloom",
      desc: "Harvested by hand at the exact moment each flower reaches its fullest, most vivid expression.",
    },
    {
      icon: "🌿",
      label: "No Chemicals. Ever.",
      desc: "Certified organic practices from seed to stem — because beauty shouldn't come at a cost to the land.",
    },
    {
      icon: "💐",
      label: "Wildly Arranged",
      desc: "Loose, abundant, untamed. Prairie Chic isn't a trend — it's what happens when the field decides.",
    },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1A0F0A 0%, #2A1208 40%, #1C1408 100%)" }}
    >
      {/* Decorative grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* ── HEADER ── */}
      <div
        ref={headRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center"
        style={{
          opacity: headIn ? 1 : 0,
          transform: headIn ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-3 mb-5"
          style={{
            fontFamily: "'Caveat', cursive",
            color: "#E8A838",
            fontSize: "1.15rem",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{ display: "block", width: 40, height: 1, background: "#E8A838", opacity: 0.6 }} />
          The Red Dirt Blooms Aesthetic
          <span style={{ display: "block", width: 40, height: 1, background: "#E8A838", opacity: 0.6 }} />
        </div>

        {/* Main headline */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#F5EFE0",
            letterSpacing: "-0.01em",
            marginBottom: "0.5rem",
          }}
        >
          Prairie
          <span
            style={{
              display: "inline-block",
              fontStyle: "italic",
              color: "#B5451B",
              marginLeft: "0.25em",
            }}
          >
            Chic.
          </span>
        </h2>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#C8B89A",
            fontSize: "1.125rem",
            maxWidth: 560,
            margin: "0 auto 0",
            lineHeight: 1.7,
          }}
        >
          Not polished. Not perfect. Wildly, unapologetically Oklahoma —
          where the red dirt runs deep and every bloom tells the story of the land it came from.
        </p>
      </div>

      {/* ── EDITORIAL IMAGE GRID ── */}
      <div
        ref={gridRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          opacity: gridIn ? 1 : 0,
          transform: gridIn ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s",
        }}
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          {/* Large hero image — spans 7 cols */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              gridColumn: "1 / 8",
              gridRow: "1 / 3",
              aspectRatio: "4/3",
            }}
          >
            <img
              src={PRAIRIE_CHIC_IMAGES.hero}
              alt="Woman in Oklahoma wildflower field at golden hour holding a bouquet"
              className="w-full h-full object-cover"
              style={{ transition: "transform 0.6s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            {/* Overlay label */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{
                background: "linear-gradient(to top, rgba(26,15,10,0.85) 0%, transparent 100%)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  color: "#E8A838",
                  fontSize: "1.1rem",
                }}
              >
                Golden Hour Harvest
              </span>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#F5EFE0",
                  fontSize: "0.85rem",
                  marginTop: 2,
                  opacity: 0.85,
                }}
              >
                Indian Blanket & Zinnia — Oklahoma's signature bloom
              </p>
            </div>
          </div>

          {/* Detail image — spans 5 cols, top half */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              gridColumn: "8 / 13",
              gridRow: "1 / 2",
              aspectRatio: "4/3",
            }}
          >
            <img
              src={PRAIRIE_CHIC_IMAGES.detail}
              alt="Rustic farm table with Oklahoma wildflower arrangement, leather gloves and vintage shears"
              className="w-full h-full object-cover"
              style={{ transition: "transform 0.6s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: "linear-gradient(to top, rgba(26,15,10,0.85) 0%, transparent 100%)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  color: "#E8A838",
                  fontSize: "1rem",
                }}
              >
                The Cutting Table
              </span>
            </div>
          </div>

          {/* Lifestyle image — spans 5 cols, bottom half */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              gridColumn: "8 / 13",
              gridRow: "2 / 3",
              aspectRatio: "4/3",
            }}
          >
            <img
              src={PRAIRIE_CHIC_IMAGES.lifestyle}
              alt="Oklahoma farmhouse porch at dusk with mason jar of wildflowers and red dirt road"
              className="w-full h-full object-cover"
              style={{ transition: "transform 0.6s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: "linear-gradient(to top, rgba(26,15,10,0.85) 0%, transparent 100%)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  color: "#E8A838",
                  fontSize: "1rem",
                }}
              >
                Porch at Dusk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOUR PILLARS ── */}
      <div
        ref={pillarsRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        style={{
          opacity: pillarsIn ? 1 : 0,
          transform: pillarsIn ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}
      >
        {/* Divider line */}
        <div
          className="mb-14"
          style={{
            borderTop: "1px solid rgba(229,196,140,0.2)",
            paddingTop: "3.5rem",
          }}
        >
          <div className="text-center mb-10">
            <span
              style={{
                fontFamily: "'Caveat', cursive",
                color: "#E8A838",
                fontSize: "1.05rem",
                letterSpacing: "0.05em",
              }}
            >
              What makes Red Dirt Blooms different
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(229,196,140,0.12)",
                  backdropFilter: "blur(4px)",
                  transition: "background 0.3s ease, border-color 0.3s ease",
                  animationDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(181,69,27,0.12)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(181,69,27,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(229,196,140,0.12)";
                }}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "#F5EFE0",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {p.label}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#A89880",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/harvest-stand">
            <button
              className="px-8 py-3 rounded-full font-semibold transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: "#B5451B",
                color: "#F5EFE0",
                fontSize: "0.95rem",
                letterSpacing: "0.03em",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#9A3A16")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#B5451B")}
            >
              Shop the Harvest Stand
            </button>
          </Link>
          <Link href="/roots-and-story">
            <button
              className="px-8 py-3 rounded-full font-semibold transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: "transparent",
                color: "#E5C48C",
                fontSize: "0.95rem",
                letterSpacing: "0.03em",
                border: "1px solid rgba(229,196,140,0.4)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(229,196,140,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(229,196,140,0.7)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(229,196,140,0.4)";
              }}
            >
              Our Story
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
