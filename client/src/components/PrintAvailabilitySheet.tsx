/**
 * PrintAvailabilitySheet
 *
 * Opens a new browser window with a clean, branded, print-ready
 * availability sheet compiled from the live harvest board data.
 *
 * Usage:
 *   <PrintAvailabilitySheetButton listings={listings} floristName="Petal & Stem" />
 */

import { Printer } from "lucide-react";

export interface PrintListing {
  id: number;
  variety: string;
  description?: string | null;
  pricePerBunch: string | number;
  quantityAvailable: number;
  quantitySold: number;
  imageUrl?: string | null;
  season?: string | null;
}

interface Props {
  listings: PrintListing[];
  floristName?: string;
}

function buildPrintHTML(listings: PrintListing[], floristName: string, printDate: string): string {
  const available = listings.filter((l) => (l.quantityAvailable - l.quantitySold) > 0);
  const soldOut = listings.filter((l) => (l.quantityAvailable - l.quantitySold) <= 0);

  const rowsAvailable = available
    .map((l) => {
      const remaining = l.quantityAvailable - l.quantitySold;
      const price = typeof l.pricePerBunch === "number"
        ? l.pricePerBunch.toFixed(2)
        : parseFloat(String(l.pricePerBunch)).toFixed(2);
      return `
        <tr>
          <td class="variety">${l.variety}</td>
          <td class="center">${l.season ?? "—"}</td>
          <td class="center price">$${price}</td>
          <td class="center qty">${remaining}</td>
          <td class="notes">${l.description ? l.description.slice(0, 80) + (l.description.length > 80 ? "…" : "") : ""}</td>
        </tr>`;
    })
    .join("");

  const rowsSoldOut = soldOut
    .map((l) => {
      const price = typeof l.pricePerBunch === "number"
        ? l.pricePerBunch.toFixed(2)
        : parseFloat(String(l.pricePerBunch)).toFixed(2);
      return `
        <tr class="sold-out-row">
          <td class="variety">${l.variety}</td>
          <td class="center">${l.season ?? "—"}</td>
          <td class="center price">$${price}</td>
          <td class="center qty sold-out-badge">SOLD OUT</td>
          <td class="notes"></td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Red Dirt Blooms — Availability Sheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Lato', sans-serif;
      font-size: 11pt;
      color: #2A1F1A;
      background: #fff;
      padding: 0.5in 0.6in;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 3px solid #B5451B;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-block {}
    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 26pt;
      color: #B5451B;
      line-height: 1;
    }
    .brand-tagline {
      font-size: 9pt;
      color: #7A8C6E;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .meta-block {
      text-align: right;
      font-size: 9pt;
      color: #2A1F1A/60;
      line-height: 1.6;
    }
    .meta-block strong { color: #B5451B; font-size: 10pt; }

    /* ── SECTION TITLE ── */
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 13pt;
      color: #2A1F1A;
      margin-bottom: 8px;
      margin-top: 22px;
      padding-bottom: 4px;
      border-bottom: 1px solid #E8D8C0;
    }
    .section-title span {
      font-family: 'Lato', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      color: #7A8C6E;
      margin-left: 8px;
    }

    /* ── TABLE ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    thead tr {
      background: #B5451B;
      color: #F5F0E8;
    }
    thead th {
      padding: 7px 10px;
      text-align: left;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    thead th.center { text-align: center; }
    tbody tr {
      border-bottom: 1px solid #EDE8DF;
    }
    tbody tr:nth-child(even) { background: #FAF7F2; }
    tbody tr:hover { background: #F5F0E8; }
    td {
      padding: 7px 10px;
      vertical-align: middle;
    }
    td.variety { font-weight: 600; color: #2A1F1A; }
    td.center { text-align: center; }
    td.price { font-weight: 700; color: #B5451B; }
    td.qty { font-weight: 700; color: #2A1F1A; }
    td.notes { font-size: 8.5pt; color: #6B5E57; font-style: italic; }

    /* Sold out rows */
    .sold-out-row { opacity: 0.55; }
    .sold-out-badge {
      font-size: 7pt;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #B5451B;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #E8D8C0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5pt;
      color: #9A8880;
    }
    .footer .contact { line-height: 1.7; }
    .footer .terms { text-align: right; line-height: 1.7; max-width: 260px; }
    .footer strong { color: #B5451B; }

    /* ── ORDER BLOCK ── */
    .order-block {
      margin-top: 22px;
      border: 1.5px solid #B5451B;
      border-radius: 4px;
      padding: 14px 16px;
      page-break-inside: avoid;
    }
    .order-block h3 {
      font-family: 'Playfair Display', serif;
      font-size: 12pt;
      color: #B5451B;
      margin-bottom: 10px;
    }
    .order-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
    }
    .order-field {
      border-bottom: 1px solid #E8D8C0;
      padding-bottom: 4px;
      font-size: 9pt;
      color: #2A1F1A/50;
    }
    .order-field label {
      display: block;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9A8880;
      margin-bottom: 2px;
    }

    /* ── PRINT OVERRIDES ── */
    @media print {
      body { padding: 0.4in 0.5in; }
      .no-print { display: none !important; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .order-block { page-break-inside: avoid; }
    }

    /* ── SCREEN-ONLY PRINT BUTTON ── */
    .print-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #B5451B;
      color: #F5F0E8;
      border: none;
      border-radius: 6px;
      padding: 10px 20px;
      font-family: 'Lato', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 24px;
    }
    .print-btn:hover { background: #9e3c17; }
  </style>
</head>
<body>

  <button class="print-btn no-print" onclick="window.print()">
    🖨️ Print / Save as PDF
  </button>

  <!-- HEADER -->
  <div class="header">
    <div class="brand-block">
      <div class="brand-name">Red Dirt Blooms</div>
      <div class="brand-tagline">Oklahoma Grown · Organically · Cut to Order</div>
    </div>
    <div class="meta-block">
      <strong>Wholesale Availability Sheet</strong><br/>
      Prepared for: ${floristName}<br/>
      Date: ${printDate}<br/>
      Contact: <a href="mailto:hello@reddirtblooms.ai" style="color:#B5451B;">hello@reddirtblooms.ai</a><br/>
      www.reddirtblooms.ai
    </div>
  </div>

  <!-- AVAILABLE NOW -->
  ${available.length > 0 ? `
  <div class="section-title">
    Available Now <span>${available.length} variet${available.length === 1 ? "y" : "ies"}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Variety</th>
        <th class="center">Season</th>
        <th class="center">Price / Bunch</th>
        <th class="center">Bunches Left</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rowsAvailable}
    </tbody>
  </table>` : `<p style="color:#9A8880;font-style:italic;margin-top:12px;">No varieties currently available — check back soon.</p>`}

  <!-- SOLD OUT -->
  ${soldOut.length > 0 ? `
  <div class="section-title">
    Sold Out This Week <span>${soldOut.length} variet${soldOut.length === 1 ? "y" : "ies"}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Variety</th>
        <th class="center">Season</th>
        <th class="center">Price / Bunch</th>
        <th class="center">Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rowsSoldOut}
    </tbody>
  </table>` : ""}

  <!-- ORDER FORM -->
  <div class="order-block">
    <h3>Order Form</h3>
    <div class="order-grid">
      <div class="order-field"><label>Business Name</label>&nbsp;</div>
      <div class="order-field"><label>Contact Name</label>&nbsp;</div>
      <div class="order-field"><label>Phone</label>&nbsp;</div>
      <div class="order-field"><label>Email</label>&nbsp;</div>
      <div class="order-field"><label>Preferred Pickup / Delivery Date</label>&nbsp;</div>
      <div class="order-field"><label>Order Total ($)</label>&nbsp;</div>
    </div>
    <div style="margin-top:12px;">
      <div class="order-field" style="grid-column:1/-1;">
        <label>Varieties &amp; Quantities Requested</label>
        <div style="height:48px;">&nbsp;</div>
      </div>
    </div>
    <div style="margin-top:10px;">
      <div class="order-field">
        <label>Special Instructions / Notes</label>
        <div style="height:36px;">&nbsp;</div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="contact">
      <strong>Red Dirt Blooms</strong><br/>
      Oklahoma City, OK<br/>
      hello@reddirtblooms.ai · www.reddirtblooms.ai
    </div>
    <div class="terms">
      Orders are first-come, first-served.<br/>
      Prices subject to change without notice.<br/>
      Minimum order: 3 bunches per variety.<br/>
      Payment due at pickup unless invoiced.
    </div>
  </div>

</body>
</html>`;
}

export function PrintAvailabilitySheetButton({ listings, floristName = "Valued Florist" }: Props) {
  const handlePrint = () => {
    const printDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = buildPrintHTML(listings, floristName, printDate);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Please allow pop-ups for this site to use the print feature.");
      return;
    }
    win.document.write(html);
    win.document.close();
    // Auto-focus so Ctrl+P works immediately
    win.focus();
  };

  return (
    <button
      onClick={handlePrint}
      title="Print or save availability sheet as PDF"
      className="flex items-center gap-2 font-body text-sm font-semibold px-4 py-2 rounded border transition-colors"
      style={{
        background: "transparent",
        borderColor: "#E8A020",
        color: "#E8A020",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#E8A020";
        (e.currentTarget as HTMLButtonElement).style.color = "#2A1F1A";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#E8A020";
      }}
    >
      <Printer size={15} />
      Availability Sheet
    </button>
  );
}
