/**
 * Red Dirt Blooms — Dynamic Pricing Sheet
 *
 * Florists can bookmark this page. Prices always reflect the live harvest board.
 * SSE auto-refreshes the data when admin updates prices.
 * Print button generates a clean PDF-ready layout.
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Printer, RefreshCw, Clock, Flower2, TrendingUp, Package } from "lucide-react";
import { toast } from "sonner";

const C = {
  bg: "#F5F0E8",
  rust: "#B5451B",
  gold: "#D4A853",
  dark: "#2A1F1A",
  sage: "#7A8C6E",
  panel: "#FFFFFF",
  border: "#E8D8C0",
  muted: "#9A8880",
};

// Category display order and colors
const CATEGORY_ORDER = ["Zinnia", "Celosia", "Strawflower", "Marigold", "Gomphrena", "Verbascum", "Basil", "Other"];
const CATEGORY_COLORS: Record<string, string> = {
  Zinnia: "#D4688A",
  Celosia: "#E87AA0",
  Strawflower: "#E8A020",
  Marigold: "#E8601A",
  Gomphrena: "#7A5C8C",
  Verbascum: "#D4A040",
  Basil: "#7A8C6E",
  Other: "#9A8880",
};

function getCategory(variety: string): string {
  const v = variety.toLowerCase();
  if (v.includes("zinnia")) return "Zinnia";
  if (v.includes("celosia")) return "Celosia";
  if (v.includes("strawflower")) return "Strawflower";
  if (v.includes("marigold")) return "Marigold";
  if (v.includes("gomphrena")) return "Gomphrena";
  if (v.includes("verbascum")) return "Verbascum";
  if (v.includes("basil")) return "Basil";
  return "Other";
}

interface Listing {
  id: number;
  variety: string;
  description: string | null;
  pricePerBunch: string;
  quantityAvailable: number;
  quantitySold: number;
  imageUrl: string | null;
  season: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}

function PriceChangeIndicator({ price }: { price: number }) {
  // Visual indicator — in a real system you'd compare to a stored previous price
  // For now, show a subtle "live" badge
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ background: `${C.sage}20`, color: C.sage }}>
      <TrendingUp size={9} /> Live
    </span>
  );
}

export default function PricingSheet() {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = trpc.useUtils();

  const query = trpc.harvest.getPublished.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const listings: Listing[] = (query.data as any) ?? [];

  // SSE — auto-refresh when admin updates prices or publishes new listings
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      es = new EventSource("/api/sse/harvest");
      es.addEventListener("harvest-update", () => {
        utils.harvest.getPublished.invalidate();
        setLastRefreshed(new Date());
        toast.info("Prices updated", { duration: 2000, position: "bottom-right", icon: "💰" });
      });
      es.onerror = () => {
        es?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  async function handleManualRefresh() {
    setIsRefreshing(true);
    await utils.harvest.getPublished.invalidate();
    setLastRefreshed(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  }

  // Group by category
  const grouped: Record<string, Listing[]> = {};
  for (const listing of listings) {
    const cat = getCategory(listing.variety);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(listing);
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0);
  const availableCount = listings.filter((l) => l.quantityAvailable - l.quantitySold > 0).length;

  function handlePrint() {
    const printDate = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const printTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const tableRows = orderedCategories.flatMap((cat) =>
      (grouped[cat] ?? []).map((l) => {
        const remaining = l.quantityAvailable - l.quantitySold;
        const price = parseFloat(l.pricePerBunch);
        const soldOut = remaining <= 0;
        return `
          <tr class="${soldOut ? "sold-out" : ""}">
            <td class="cat-dot"><span style="background:${CATEGORY_COLORS[cat] ?? "#9A8880"};width:10px;height:10px;border-radius:50%;display:inline-block;"></span></td>
            <td class="variety">${l.variety}</td>
            <td class="center">${cat}</td>
            <td class="center">${l.season ?? "—"}</td>
            <td class="center price">$${price.toFixed(2)}</td>
            <td class="center qty">${soldOut ? '<span class="sold-out-badge">SOLD OUT</span>' : remaining}</td>
          </tr>`;
      })
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Red Dirt Blooms — Live Pricing Sheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Lato', sans-serif; font-size: 11pt; color: #2A1F1A; background: #fff; padding: 0.5in 0.6in; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #B5451B; padding-bottom: 14px; margin-bottom: 18px; }
    .brand-name { font-family: 'Playfair Display', serif; font-size: 26pt; color: #B5451B; line-height: 1; }
    .brand-tagline { font-size: 9pt; color: #7A8C6E; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px; }
    .meta-block { text-align: right; font-size: 9pt; color: #6B5E57; line-height: 1.7; }
    .meta-block strong { color: #B5451B; font-size: 10pt; }
    .live-badge { display: inline-block; background: #7A8C6E20; color: #7A8C6E; font-size: 8pt; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-top: 4px; border: 1px solid #7A8C6E40; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    thead tr { background: #B5451B; color: #F5F0E8; }
    thead th { padding: 7px 10px; text-align: left; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    thead th.center { text-align: center; }
    tbody tr { border-bottom: 1px solid #EDE8DF; }
    tbody tr:nth-child(even) { background: #FAF7F2; }
    td { padding: 7px 10px; vertical-align: middle; }
    td.cat-dot { width: 20px; padding-right: 0; }
    td.variety { font-weight: 600; color: #2A1F1A; }
    td.center { text-align: center; }
    td.price { font-weight: 700; color: #B5451B; }
    td.qty { font-weight: 700; }
    .sold-out { opacity: 0.5; }
    .sold-out-badge { font-size: 7pt; font-weight: 800; letter-spacing: 0.06em; color: #B5451B; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E8D8C0; display: flex; justify-content: space-between; font-size: 8.5pt; color: #9A8880; }
    .footer strong { color: #B5451B; }
    .print-btn { display: inline-flex; align-items: center; gap: 8px; background: #B5451B; color: #F5F0E8; border: none; border-radius: 6px; padding: 10px 20px; font-family: 'Lato', sans-serif; font-size: 11pt; font-weight: 700; cursor: pointer; margin-bottom: 24px; }
    @media print { .print-btn { display: none !important; } thead { display: table-header-group; } tr { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <div class="header">
    <div>
      <div class="brand-name">Red Dirt Blooms</div>
      <div class="brand-tagline">Oklahoma Grown · Organically · Cut to Order</div>
      <div class="live-badge">⚡ Live Pricing — Updates with Market</div>
    </div>
    <div class="meta-block">
      <strong>Wholesale Pricing Sheet</strong><br/>
      Generated: ${printDate}<br/>
      Time: ${printTime}<br/>
      <a href="https://www.reddirtblooms.ai/pricing-sheet" style="color:#B5451B;">reddirtblooms.ai/pricing-sheet</a><br/>
      hello@reddirtblooms.ai
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:20px;"></th>
        <th>Variety</th>
        <th class="center">Category</th>
        <th class="center">Season</th>
        <th class="center">Price / Bunch</th>
        <th class="center">Bunches Available</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    <div><strong>Red Dirt Blooms</strong><br/>Oklahoma City, OK · hello@reddirtblooms.ai · www.reddirtblooms.ai</div>
    <div style="text-align:right;">Prices subject to change without notice.<br/>Minimum order: 3 bunches per variety.<br/>Orders: first-come, first-served.</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { alert("Please allow pop-ups to use the print feature."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  if (query.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={32} className="animate-spin" style={{ color: C.rust }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 lg:pt-20" style={{ background: C.bg }}>
      {/* Page Header */}
      <div className="border-b" style={{ borderColor: C.border, background: C.panel }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-accent text-sm mb-1" style={{ color: C.rust }}>Red Dirt Blooms</div>
              <h1 className="font-heading font-bold text-3xl" style={{ color: C.dark }}>
                Live Pricing Sheet
              </h1>
              <p className="font-body text-sm mt-1" style={{ color: C.muted }}>
                Prices update automatically when the harvest board changes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleManualRefresh}
                className="flex items-center gap-2 px-3 py-2 rounded border font-body text-sm font-semibold transition-colors"
                style={{ borderColor: C.border, color: C.muted, background: "transparent" }}>
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                Refresh
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded font-body text-sm font-semibold transition-colors"
                style={{ background: C.rust, color: C.bg }}>
                <Printer size={14} />
                Print / PDF
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <Flower2 size={14} style={{ color: C.sage }} />
              <span className="font-body text-xs" style={{ color: C.muted }}>
                <strong style={{ color: C.dark }}>{listings.length}</strong> varieties listed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={14} style={{ color: C.sage }} />
              <span className="font-body text-xs" style={{ color: C.muted }}>
                <strong style={{ color: C.dark }}>{availableCount}</strong> available now
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: C.sage }} />
              <span className="font-body text-xs" style={{ color: C.muted }}>
                Last updated: <strong style={{ color: C.dark }}>{lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: `${C.sage}15`, border: `1px solid ${C.sage}30` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.sage }} />
              <span className="font-body text-[10px] font-semibold" style={{ color: C.sage }}>Live — auto-updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tables by Category */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Flower2 size={40} className="mx-auto mb-4" style={{ color: C.border }} />
            <p className="font-heading text-xl font-bold mb-2" style={{ color: C.dark }}>No listings published yet</p>
            <p className="font-body text-sm" style={{ color: C.muted }}>Check back soon — new varieties are added weekly.</p>
          </div>
        ) : (
          orderedCategories.map((cat) => {
            const catListings = grouped[cat] ?? [];
            const catColor = CATEGORY_COLORS[cat] ?? C.muted;
            return (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: catColor }} />
                  <h2 className="font-heading font-bold text-lg" style={{ color: C.dark }}>{cat}</h2>
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                  <span className="font-body text-xs" style={{ color: C.muted }}>
                    {catListings.filter((l) => l.quantityAvailable - l.quantitySold > 0).length} of {catListings.length} available
                  </span>
                </div>

                {/* Table */}
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: C.border }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: catColor }}>
                        <th className="text-left px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-white">Variety</th>
                        <th className="text-center px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-white hidden sm:table-cell">Season</th>
                        <th className="text-center px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-white">Price / Bunch</th>
                        <th className="text-center px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-white">Available</th>
                        <th className="text-center px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-white hidden md:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catListings.map((l, idx) => {
                        const remaining = l.quantityAvailable - l.quantitySold;
                        const price = parseFloat(l.pricePerBunch);
                        const soldOut = remaining <= 0;
                        const low = !soldOut && remaining <= 5;
                        return (
                          <tr key={l.id}
                            style={{
                              background: idx % 2 === 0 ? C.panel : "#FAF7F2",
                              opacity: soldOut ? 0.55 : 1,
                            }}>
                            <td className="px-4 py-3">
                              <div className="font-body font-semibold text-sm" style={{ color: C.dark }}>{l.variety}</div>
                              {l.description && (
                                <div className="font-body text-xs mt-0.5 hidden md:block" style={{ color: C.muted }}>
                                  {l.description.slice(0, 70)}{l.description.length > 70 ? "…" : ""}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-body text-xs hidden sm:table-cell" style={{ color: C.muted }}>
                              {l.season ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-body font-bold text-base" style={{ color: C.rust }}>
                                  ${price.toFixed(2)}
                                </span>
                                <PriceChangeIndicator price={price} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {soldOut ? (
                                <span className="font-body text-xs font-bold px-2 py-0.5 rounded"
                                  style={{ background: `${C.rust}15`, color: C.rust }}>
                                  Sold Out
                                </span>
                              ) : (
                                <span className="font-body font-bold text-sm" style={{ color: low ? C.rust : C.dark }}>
                                  {remaining}
                                  {low && <span className="font-body text-xs ml-1" style={{ color: C.rust }}>low</span>}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden md:table-cell">
                              {soldOut ? (
                                <span className="font-body text-xs" style={{ color: C.muted }}>—</span>
                              ) : (
                                <span className="font-body text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: `${C.sage}15`, color: C.sage }}>
                                  ✓ Available
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Pricing notes */}
        {listings.length > 0 && (
          <div className="rounded-lg p-5 border" style={{ background: C.panel, borderColor: C.border }}>
            <h3 className="font-heading font-bold text-base mb-3" style={{ color: C.dark }}>Pricing Notes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["Minimum Order", "3 bunches per variety"],
                ["Pricing", "Subject to change with market conditions"],
                ["Availability", "First-come, first-served — order early"],
                ["Payment", "Card via Stripe or invoice (net 7)"],
                ["Pickup", "Oklahoma City area — contact for details"],
                ["Custom Orders", "Contact us for special requests or bulk pricing"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="font-body text-xs font-bold flex-shrink-0 w-28" style={{ color: C.muted }}>{label}:</span>
                  <span className="font-body text-xs" style={{ color: C.dark }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookmark CTA */}
        <div className="text-center py-6">
          <p className="font-body text-sm" style={{ color: C.muted }}>
            Bookmark this page — prices update automatically when the harvest board changes.
          </p>
          <p className="font-body text-xs mt-1" style={{ color: C.muted }}>
            <a href="https://www.reddirtblooms.ai/pricing-sheet" style={{ color: C.rust }}>
              www.reddirtblooms.ai/pricing-sheet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
