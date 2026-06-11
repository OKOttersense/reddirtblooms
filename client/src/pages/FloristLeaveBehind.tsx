/**
 * /florist-leave-behind
 * Branded printable one-pager for florist meetings.
 * Open in browser → click Print → Save as PDF.
 * Print CSS hides the button automatically.
 */

import { Printer, MapPin, Mail, Globe, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const VARIETIES = [
  { name: "White Yarrow", bundle: "10 stems", life: "10–14 days", tags: ["Filler", "Dried"], color: "#7A8C6E" },
  { name: "Red Yarrow", bundle: "10 stems", life: "10–14 days", tags: ["Filler", "Dried"], color: "#B5451B" },
  { name: "Lamb's Ear", bundle: "5 stems", life: "7–10 days", tags: ["Foliage", "Bridal"], color: "#7A8C6E" },
  { name: "Verbena bonariensis", bundle: "10 stems", life: "7–10 days", tags: ["Filler", "Airy"], color: "#7A5C8C" },
  { name: "Bee Balm", bundle: "5 stems", life: "7–10 days", tags: ["Focal", "Fragrant"], color: "#C84040" },
  { name: "Gaura", bundle: "10 stems", life: "7–10 days", tags: ["Filler", "Wedding"], color: "#9A8880" },
  { name: "Red Gomphrena", bundle: "10 stems", life: "14+ days", tags: ["Dried", "Long-lasting"], color: "#C03040" },
  { name: "St. John's Wort", bundle: "5 stems", life: "10–14 days", tags: ["Texture", "Dried"], color: "#D4A853" },
];

const WHY_POINTS = [
  {
    icon: "✂",
    title: "Same-Morning Cut",
    body: "Flowers go from field to your shop within hours — not days. That's 3–5 extra days of vase life for your customers.",
  },
  {
    icon: "❄",
    title: "No Cold Chain",
    body: "We never cold-store our flowers. Cold-chain damage is the #1 cause of early petal drop. Ours arrive field-fresh.",
  },
  {
    icon: "📍",
    title: "Oklahoma Grown",
    body: "Local sourcing story your customers love. \"Grown 20 miles away\" sells arrangements.",
  },
  {
    icon: "📱",
    title: "Weekly Harvest Texts",
    body: "We text you on harvest day with what's available. No guessing, no wasted trips.",
  },
  {
    icon: "↩",
    title: "We Make It Right",
    body: "If a stem underperforms, we replace it. No questions, no hassle.",
  },
];

const ORDER_STEPS = [
  { num: 1, title: "Get on the harvest list", body: "Text or email us to receive weekly availability updates." },
  { num: 2, title: "Browse live inventory", body: "Visit reddirtblooms.ai/florist-portal or reply to the harvest text." },
  { num: 3, title: "Place your order", body: "Pay by card online or request a net-7 invoice. Minimum 3 bunches per variety." },
  { num: 4, title: "Pick up or arrange delivery", body: "Oklahoma City area. Contact us to discuss your needs." },
];

export default function FloristLeaveBehind() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Print button — hidden on print */}
      <div className="print:hidden flex justify-center py-6 gap-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#B5451B] text-[#F5F0E8] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#9A3A15] transition-colors"
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
        <a
          href="/florist-sample-cards"
          target="_blank"
          className="flex items-center gap-2 border border-[#B5451B] text-[#B5451B] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#B5451B10] transition-colors"
        >
          View Sample Cards →
        </a>
      </div>

      {/* Page — letter-sized feel */}
      <div
        className="bg-white mx-auto shadow-lg print:shadow-none"
        style={{ maxWidth: "8.5in", padding: "0.55in 0.65in" }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b-[3px] border-[#B5451B] pb-4 mb-5">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30pt", color: "#B5451B", lineHeight: 1 }}>
              Red Dirt Blooms
            </h1>
            <p className="text-[#7A8C6E] text-xs tracking-widest uppercase mt-1">
              Oklahoma Grown · Organically · Cut to Order
            </p>
          </div>
          <div className="text-right text-xs text-[#6B5E57] leading-relaxed">
            <span className="font-bold text-[#B5451B] block text-sm">Wholesale Partner Program</span>
            Season: Summer–Fall 2025<br />
            Oklahoma City, OK<br />
            hello@reddirtblooms.ai
          </div>
        </div>

        {/* ── Intro strip ── */}
        <div className="bg-[#B5451B] text-[#F5F0E8] rounded-lg p-4 mb-5 flex items-center gap-6">
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15pt", lineHeight: 1.2, flex: 1 }}>
            Same-morning cut.<br />
            <em className="text-[#D4A853]">No cold chain. No middleman.</em>
          </div>
          <div className="flex gap-5 shrink-0">
            {[["20+", "Varieties"], ["3–5", "Extra Vase Days"], ["3", "Bunch Min."]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20pt", color: "#D4A853", lineHeight: 1 }}>{num}</div>
                <div className="text-[9px] tracking-wider uppercase opacity-80 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">

          {/* Left: Varieties */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "11pt", color: "#B5451B", borderBottom: "1px solid #E8D8C0", paddingBottom: "5px", marginBottom: "10px" }}>
              What I'm Growing This Season
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {VARIETIES.map((v) => (
                <div key={v.name} className="border border-[#E8D8C0] rounded-md p-2 bg-[#FAF7F2]">
                  <div className="font-bold text-[9pt] text-[#2A1F1A]">{v.name}</div>
                  <div className="text-[7.5pt] text-[#9A8880] mt-0.5">{v.bundle} · {v.life}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[6.5pt] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded"
                        style={{ background: v.color + "20", color: v.color }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[7.5pt] text-[#9A8880] mt-2">
              + Zinnias, Celosias, Strawflowers, Marigolds, Basil, Verbascum &amp; more — see full list at reddirtblooms.ai
            </p>
          </div>

          {/* Right: Why + How to Order */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "11pt", color: "#B5451B", borderBottom: "1px solid #E8D8C0", paddingBottom: "5px", marginBottom: "10px" }}>
              Why Red Dirt Blooms
            </h2>
            <div className="flex flex-col gap-2 mb-4">
              {WHY_POINTS.map((p) => (
                <div key={p.title} className="flex gap-2 items-start">
                  <div
                    className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9pt] text-[#F5F0E8] mt-0.5"
                    style={{ background: "#B5451B" }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-bold text-[9pt] text-[#2A1F1A]">{p.title}</div>
                    <div className="text-[8.5pt] text-[#6B5E57]">{p.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "11pt", color: "#B5451B", borderBottom: "1px solid #E8D8C0", paddingBottom: "5px", marginBottom: "10px" }}>
              How to Order
            </h2>
            <div className="flex flex-col gap-2">
              {ORDER_STEPS.map((s) => (
                <div key={s.num} className="flex gap-2.5 items-start">
                  <div
                    className="shrink-0 w-[20px] h-[20px] rounded-full flex items-center justify-center text-[8pt] font-extrabold text-[#2A1F1A] mt-0.5"
                    style={{ background: "#D4A853" }}
                  >
                    {s.num}
                  </div>
                  <div className="text-[9pt]">
                    <span className="font-bold text-[#B5451B]">{s.title}</span>
                    {" — "}{s.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pricing table ── */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "11pt", color: "#B5451B", borderBottom: "1px solid #E8D8C0", paddingBottom: "5px", marginBottom: "8px" }}>
          Sample Pricing
        </h2>
        <table className="w-full text-[8.5pt] border-collapse mb-1">
          <thead>
            <tr>
              {["Variety", "Bundle", "Price / Bunch", "Best Use", "Season"].map((h) => (
                <th key={h} className="text-left text-[7.5pt] tracking-widest uppercase bg-[#2A1F1A] text-[#F5F0E8] px-2 py-1.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["White & Red Yarrow", "10 stems", "Market", "Filler, Dried", "Summer–Fall"],
              ["Lamb's Ear", "5 stems", "Market", "Foliage, Bridal", "Summer"],
              ["Verbena bonariensis", "10 stems", "Market", "Airy Filler", "Summer–Fall"],
              ["Bee Balm", "5 stems", "Market", "Focal, Fragrant", "Summer"],
              ["Gaura", "10 stems", "Market", "Filler, Wedding", "Summer–Fall"],
              ["Red Gomphrena", "10 stems", "Market", "Dried, Filler", "Summer–Fall"],
              ["Zinnias (all varieties)", "10 stems", "Market", "Focal, Color", "Summer–Fall"],
              ["Celosias (all varieties)", "10 stems", "Market", "Focal, Texture", "Summer–Fall"],
            ].map(([variety, bundle, price, use, season], i) => (
              <tr key={variety} className={i % 2 === 1 ? "bg-[#FAF7F2]" : ""}>
                <td className="px-2 py-1.5 border-b border-[#EDE8DF]">{variety}</td>
                <td className="px-2 py-1.5 border-b border-[#EDE8DF]">{bundle}</td>
                <td className="px-2 py-1.5 border-b border-[#EDE8DF] font-bold text-[#B5451B]">{price}</td>
                <td className="px-2 py-1.5 border-b border-[#EDE8DF]">{use}</td>
                <td className="px-2 py-1.5 border-b border-[#EDE8DF]">{season}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[7.5pt] text-[#9A8880] mb-5">
          Live pricing always available at <strong className="text-[#B5451B]">reddirtblooms.ai/pricing-sheet</strong> — updates automatically with market conditions.
        </p>

        {/* ── CTA strip ── */}
        <div className="bg-[#2A1F1A] text-[#F5F0E8] rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "13pt", color: "#D4A853" }}>
              Ready to try a bundle?
            </div>
            <div className="text-[8.5pt] text-[#C8C0B0] mt-1">
              Scan the QR code to see this week's live inventory and pricing.<br />
              No account needed to browse — register in 2 minutes to order.
            </div>
          </div>
          {/* Auto-generated QR code */}
          <div className="shrink-0 bg-white p-1.5 rounded">
            <QRCodeSVG
              value={`${window.location.origin}/pricing-sheet`}
              size={72}
              bgColor="#ffffff"
              fgColor="#2A1F1A"
              level="M"
            />
          </div>
          <div className="text-right text-[8.5pt] text-[#C8C0B0] leading-relaxed">
            <span className="text-[#D4A853] font-bold block">Lance Neely</span>
            Red Dirt Blooms<br />
            Oklahoma City, OK<br />
            hello@reddirtblooms.ai<br />
            reddirtblooms.ai
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 text-center text-[7.5pt] text-[#B0A898] border-t border-[#E8D8C0] pt-3">
          Red Dirt Blooms · Oklahoma City, OK · hello@reddirtblooms.ai · www.reddirtblooms.ai · Prices subject to change with market conditions · Minimum 3 bunches per variety
        </div>
      </div>

      {/* Bottom spacer for screen view */}
      <div className="print:hidden h-8" />
    </div>
  );
}
