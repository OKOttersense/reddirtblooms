/**
 * CSA Member Stories + Gallery Preview Section
 * Injected into CSALanding.tsx between Pickup Info and FAQ
 */
export default function CSAMemberSection() {
  const testimonials = [
    {
      quote:
        "I've tried every flower subscription service in OKC. Nothing comes close. These are cut the same morning they arrive on my doorstep. My dining room has never looked better.",
      name: "Catherine W.",
      location: "Nichols Hills",
      tier: "Full Bloom Member",
      initial: "C",
      color: "#C0392B",
    },
    {
      quote:
        "As a florist, I'm picky. The quality from Red Dirt Blooms is genuinely exceptional — varieties you can't find at any wholesaler, grown organically, and delivered with care. My clients ask about them every week.",
      name: "Margaux T.",
      location: "The Paseo, OKC",
      tier: "Florist Member",
      initial: "M",
      color: "#5D8A5E",
    },
    {
      quote:
        "We gave the Spring Harvest Share as a Mother's Day gift. My mom cried. She said it was the most thoughtful gift she'd ever received. We renewed for fall before spring was even over.",
      name: "James & Sarah K.",
      location: "Edmond",
      tier: "Spring Harvest Share",
      initial: "J",
      color: "#D4A853",
    },
  ];

  const galleryPreviews = [
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-csa-box-JdfmSaVUKCdjyf2T9zxPUU.webp",
      label: "The Bloom Box",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-dahlia-closeup-VXbsdbVnRHwXnH8hZ7vAMu.webp",
      label: "Dinner Plate Dahlia",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-bouquet-table-Nhhwmjh5hjqQXotJbPGZgw.webp",
      label: "Oklahoma Kitchen",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-zinnia-row-ZghCW29mWpsd4wRVNGmbMG.webp",
      label: "Zinnia Row",
    },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#1A0F0A" }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="text-xs font-medium tracking-[0.3em] uppercase mb-4 block"
            style={{ color: "#D4A853", fontFamily: "'DM Sans', sans-serif" }}
          >
            From Our Members
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#F5EFE6",
            }}
          >
            Life's Better With{" "}
            <span style={{ color: "#C0392B", fontStyle: "italic" }}>
              Flowers on the Table
            </span>
          </h2>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: "#8A7A6A", fontFamily: "'DM Sans', sans-serif" }}
          >
            Real words from real Oklahoma families who made the Bloom Box part
            of their weekly ritual.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, s) => (
                  <svg
                    key={s}
                    className="w-4 h-4"
                    fill="#D4A853"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{
                  color: "#C8B89A",
                  fontFamily: "'DM Sans', sans-serif",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{
                    background: t.color,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{
                      color: "#F5EFE6",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: "#6B5A4E",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {t.location} · {t.tier}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Preview Strip */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
            {galleryPreviews.map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden group cursor-pointer"
                style={{ aspectRatio: "1/1" }}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(26,15,10,0.85) 0%, transparent 60%)",
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "#F5EFE6",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="p-4 text-center"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <a
              href="/gallery"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#D4A853", fontFamily: "'DM Sans', sans-serif" }}
            >
              View the Full Gallery →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
