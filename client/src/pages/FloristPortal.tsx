/**
 * Florist Portal — Live Wholesale Harvest Board
 * Approved florists see this week's harvest with photos, prices, and quantities.
 * Cart → Stripe checkout or Invoice request.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShoppingCart, X, Plus, Minus, Loader2, CheckCircle, Package, LogOut, ChevronRight } from "lucide-react";
import { PrintAvailabilitySheetButton } from "@/components/PrintAvailabilitySheet";

const C = {
  bg: "#0D0805",
  rust: "#B5451B",
  gold: "#D4A853",
  cream: "#F5F0E8",
  creamDim: "#C8C0B0",
  panel: "#1A1208",
  border: "#2A1F10",
  cardBg: "#150F07",
};

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
}

interface CartItem {
  listingId: number;
  variety: string;
  pricePerBunch: number;
  quantity: number;
  imageUrl: string | null;
  maxQty: number;
}

function CartSidebar({ cart, onClose, onUpdateQty, onRemove, onCheckout, onInvoice, checkoutLoading, invoiceLoading }: {
  cart: CartItem[]; onClose: () => void; onUpdateQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void; onCheckout: () => void; onInvoice: () => void;
  checkoutLoading: boolean; invoiceLoading: boolean;
}) {
  const total = cart.reduce((s, i) => s + i.pricePerBunch * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <div className="w-full max-w-md flex flex-col" style={{ background: C.panel, borderLeft: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-semibold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>Your Order</h2>
          <button onClick={onClose} style={{ color: C.creamDim }}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 && <p className="text-center py-12" style={{ color: C.creamDim }}>Your cart is empty</p>}
          {cart.map((item) => (
            <div key={item.listingId} className="flex gap-3 items-start">
              {item.imageUrl && <img src={item.imageUrl} alt={item.variety} className="w-16 h-16 rounded object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: C.cream }}>{item.variety}</p>
                <p className="text-xs mt-0.5" style={{ color: C.gold }}>${item.pricePerBunch.toFixed(2)}/bunch</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQty(item.listingId, -1)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: C.border, color: C.cream }}><Minus size={12} /></button>
                  <span className="text-sm w-6 text-center" style={{ color: C.cream }}>{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.listingId, 1)} disabled={item.quantity >= item.maxQty} className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-40" style={{ background: C.border, color: C.cream }}><Plus size={12} /></button>
                  <button onClick={() => onRemove(item.listingId)} className="ml-auto text-xs" style={{ color: C.creamDim }}>Remove</button>
                </div>
              </div>
              <p className="text-sm font-semibold flex-shrink-0" style={{ color: C.cream }}>${(item.pricePerBunch * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="px-6 py-5 space-y-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex justify-between text-sm font-semibold">
              <span style={{ color: C.creamDim }}>Order Total</span>
              <span style={{ color: C.cream }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} disabled={checkoutLoading || invoiceLoading} className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: C.rust, color: C.cream }}>
              {checkoutLoading && <Loader2 size={16} className="animate-spin" />}Pay Now via Card
            </button>
            <button onClick={onInvoice} disabled={checkoutLoading || invoiceLoading} className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 border transition-opacity hover:opacity-80 disabled:opacity-50" style={{ borderColor: C.gold, color: C.gold, background: "transparent" }}>
              {invoiceLoading && <Loader2 size={16} className="animate-spin" />}Request Invoice
            </button>
            <p className="text-xs text-center" style={{ color: C.creamDim }}>Invoice requests fulfilled within 1 business day</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing, cartQty, onAdd, onUpdateQty }: { listing: Listing; cartQty: number; onAdd: () => void; onUpdateQty: (delta: number) => void; }) {
  const remaining = listing.quantityAvailable - listing.quantitySold;
  const price = parseFloat(listing.pricePerBunch);
  const soldOut = remaining <= 0;
  return (
    <div className="rounded-lg overflow-hidden flex flex-col" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
      <div className="relative aspect-[4/3] bg-black/20">
        {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.variety} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={48} style={{ color: C.border }} /></div>}
        {soldOut && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><span className="text-sm font-semibold px-3 py-1 rounded" style={{ background: C.rust, color: C.cream }}>Sold Out</span></div>}
        {!soldOut && remaining <= 5 && <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-medium" style={{ background: C.gold, color: C.bg }}>Only {remaining} left</div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>{listing.variety}</h3>
        {listing.description && <p className="text-xs mt-1 flex-1" style={{ color: C.creamDim }}>{listing.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-bold" style={{ color: C.gold }}>${price.toFixed(2)}</p>
            <p className="text-xs" style={{ color: C.creamDim }}>per bunch</p>
          </div>
          <p className="text-xs" style={{ color: remaining <= 5 ? C.rust : C.creamDim }}>{soldOut ? "—" : `${remaining} available`}</p>
        </div>
        {!soldOut && (
          <div className="mt-3">
            {cartQty === 0
              ? <button onClick={onAdd} className="w-full py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: C.rust, color: C.cream }}>Add to Order</button>
              : <div className="flex items-center justify-between">
                  <button onClick={() => onUpdateQty(-1)} className="w-8 h-8 rounded flex items-center justify-center" style={{ background: C.border, color: C.cream }}><Minus size={14} /></button>
                  <span className="text-sm font-semibold" style={{ color: C.cream }}>{cartQty} in order</span>
                  <button onClick={() => onUpdateQty(1)} disabled={cartQty >= remaining} className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40" style={{ background: C.rust, color: C.cream }}><Plus size={14} /></button>
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloristPortal() {
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") === "success") {
      setOrderSuccess(true);
      setCart([]);
      window.history.replaceState({}, "", "/florist-portal");
    }
  }, []);

  const meQuery = trpc.floristPortal.me.useQuery(undefined, { retry: false });
  const florist = meQuery.data;
  const boardQuery = trpc.floristPortal.getHarvestBoard.useQuery(undefined, { enabled: !!florist, retry: false });
  const listings: Listing[] = (boardQuery.data as any) ?? [];
  const utils = trpc.useUtils();

  // ── SSE: auto-refresh harvest board when admin publishes/updates ──────────
  useEffect(() => {
    if (!florist) return;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      es = new EventSource("/api/sse/harvest");
      es.addEventListener("harvest-update", () => {
        utils.floristPortal.getHarvestBoard.invalidate();
        toast.info("Harvest board updated", { duration: 2500, position: "bottom-right" });
      });
      es.onerror = () => {
        es?.close();
        // Reconnect after 5 s if the connection drops
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [!!florist]);

  const checkoutMutation = trpc.floristPortal.checkout.useMutation();
  const invoiceMutation = trpc.floristPortal.requestInvoice.useMutation();
  const logoutMutation = trpc.floristAuth.logout.useMutation({ onSuccess: () => navigate("/florist-login") });

  const cartTotal = cart.reduce((s, i) => s + i.pricePerBunch * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  function addToCart(listing: Listing) {
    const remaining = listing.quantityAvailable - listing.quantitySold;
    setCart((prev) => {
      const existing = prev.find((i) => i.listingId === listing.id);
      if (existing) return prev.map((i) => i.listingId === listing.id ? { ...i, quantity: Math.min(i.quantity + 1, remaining) } : i);
      return [...prev, { listingId: listing.id, variety: listing.variety, pricePerBunch: parseFloat(listing.pricePerBunch), quantity: 1, imageUrl: listing.imageUrl, maxQty: remaining }];
    });
  }

  function updateCartQty(listingId: number, delta: number) {
    setCart((prev) => prev.map((i) => i.listingId !== listingId ? i : { ...i, quantity: Math.max(0, Math.min(i.quantity + delta, i.maxQty)) }).filter((i) => i.quantity > 0));
  }

  function removeFromCart(listingId: number) {
    setCart((prev) => prev.filter((i) => i.listingId !== listingId));
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    try {
      const result = await checkoutMutation.mutateAsync({ items: cart.map((i) => ({ listingId: i.listingId, quantity: i.quantity })), origin: window.location.origin });
      if (result.checkoutUrl) { window.location.href = result.checkoutUrl; }
    } catch (err: any) { toast.error(err.message ?? "Checkout failed. Please try again."); }
  }

  async function handleInvoice() {
    if (cart.length === 0) return;
    try {
      await invoiceMutation.mutateAsync({ items: cart.map((i) => ({ listingId: i.listingId, quantity: i.quantity })) });
      setCart([]); setCartOpen(false); setInvoiceSuccess(true);
    } catch (err: any) { toast.error(err.message ?? "Invoice request failed. Please try again."); }
  }

  if (meQuery.isLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}><Loader2 size={32} className="animate-spin" style={{ color: C.gold }} /></div>;

  if (!florist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg, color: C.cream }}>
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.gold }}>Red Dirt Blooms</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Florist Wholesale Portal</h1>
            <p className="mt-3 text-sm" style={{ color: C.creamDim }}>This portal is for approved wholesale partners. Log in to see this week's harvest.</p>
          </div>
          <div className="space-y-3">
            <Link href="/florist-login"><button className="w-full py-3 rounded font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: C.rust, color: C.cream }}>Log In to Portal</button></Link>
            <Link href="/florist-register"><button className="w-full py-3 rounded font-semibold text-sm border transition-opacity hover:opacity-80" style={{ borderColor: C.gold, color: C.gold, background: "transparent" }}>Apply for Wholesale Access</button></Link>
          </div>
          <Link href="/" className="text-xs" style={{ color: C.creamDim }}>← Back to Red Dirt Blooms</Link>
        </div>
      </div>
    );
  }

  if (florist.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg, color: C.cream }}>
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: C.panel }}><Package size={28} style={{ color: C.gold }} /></div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Application Under Review</h1>
          <p style={{ color: C.creamDim }}>Hi {florist.contactName}, your application for <strong>{florist.businessName}</strong> is being reviewed. We'll email you at <strong>{florist.email}</strong> once approved.</p>
          <p className="text-sm" style={{ color: C.creamDim }}>Typical review time: 1–2 business days.</p>
          <button onClick={() => logoutMutation.mutate()} className="text-xs mt-4" style={{ color: C.creamDim }}>Log out</button>
        </div>
      </div>
    );
  }

  if (orderSuccess || invoiceSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg, color: C.cream }}>
        <div className="max-w-md w-full text-center space-y-5">
          <CheckCircle size={56} className="mx-auto" style={{ color: C.gold }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{orderSuccess ? "Order Confirmed!" : "Invoice Requested!"}</h1>
          <p style={{ color: C.creamDim }}>{orderSuccess ? "Thank you! Your payment was received. Lance will have your order ready for pickup." : "Your invoice request has been submitted. Lance will send your invoice within 1 business day."}</p>
          <button onClick={() => { setOrderSuccess(false); setInvoiceSuccess(false); }} className="px-6 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: C.rust, color: C.cream }}>Back to Harvest Board</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.cream }}>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>Red Dirt Blooms</p>
          <p className="text-sm font-semibold" style={{ color: C.cream }}>Wholesale Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:block" style={{ color: C.creamDim }}>{florist.businessName}</span>
          <PrintAvailabilitySheetButton listings={listings} floristName={florist.businessName} />
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: C.rust, color: C.cream }}>
            <ShoppingCart size={16} /><span>Order ({cartCount})</span>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: C.gold, color: C.bg }}>{cartCount}</span>}
          </button>
          <button onClick={() => logoutMutation.mutate()} className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: C.creamDim }}>
            <LogOut size={14} /><span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>

      <div className="px-6 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-8 rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          {/* Left — photo */}
          <div className="relative" style={{ minHeight: "260px" }}>
            <img
              src="/manus-storage/lance-garden-option2_3ea714c2.png"
              alt="Lance harvesting flowers at Red Dirt Blooms"
              className="w-full h-full object-cover"
              style={{ maxHeight: "340px", objectPosition: "top center" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, " + C.panel + ")" }} />
          </div>
          {/* Right — harvest process */}
          <div className="p-7 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.gold }}>From the Grower</p>
            <h3 className="text-xl font-bold mb-3" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>How We Harvest</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: C.creamDim }}>
              Every stem on this board was cut within the last 24–48 hours. We harvest in the early morning — before 8 AM — when temperatures are coolest and stems are fully hydrated. That single habit adds 2–3 days to vase life compared to midday cutting.
            </p>
            <ul className="space-y-2 text-sm" style={{ color: C.creamDim }}>
              {[
                { step: "Early morning cut", detail: "Harvested before 8 AM at peak stem hydration" },
                { step: "Immediate conditioning", detail: "Stems go straight into clean, cool water with floral preservative" },
                { step: "24-hour rest", detail: "Flowers rest in the cooler overnight before packing" },
                { step: "Cut-to-order", detail: "Nothing sits — bunches are packed the morning of your pickup or delivery" },
              ].map(({ step, detail }) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.rust }} />
                  <span><span className="font-semibold" style={{ color: C.cream }}>{step}</span> — {detail}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs mt-4" style={{ color: C.creamDim }}>
              Questions or special requests? Reach out directly — I'm always happy to plan ahead for events.
            </p>
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.gold }}>This Week's Harvest</p>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Fresh from the Field</h1>
        <p className="mt-2 text-sm" style={{ color: C.creamDim }}>Wholesale pricing for approved florist partners. All bunches are cut-to-order from our OKC Metro farm.</p>
      </div>

      <div className="px-6 pb-16 max-w-6xl mx-auto">
        {boardQuery.isLoading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin" style={{ color: C.gold }} /></div>}
        {!boardQuery.isLoading && listings.length === 0 && (
          <div className="text-center py-20 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <Package size={48} className="mx-auto mb-4" style={{ color: C.border }} />
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Harvest Posted Yet</h2>
            <p className="text-sm" style={{ color: C.creamDim }}>Lance will post this week's available varieties soon. Check back or watch for your harvest email.</p>
          </div>
        )}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => {
              const cartItem = cart.find((i) => i.listingId === listing.id);
              return <ListingCard key={listing.id} listing={listing} cartQty={cartItem?.quantity ?? 0} onAdd={() => addToCart(listing)} onUpdateQty={(delta) => updateCartQty(listing.id, delta)} />;
            })}
          </div>
        )}
        {cartCount > 0 && !cartOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: C.rust, color: C.cream }}>
              <ShoppingCart size={18} />
              <span>{cartCount} item{cartCount !== 1 ? "s" : ""} — ${cartTotal.toFixed(2)}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {cartOpen && <CartSidebar cart={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateCartQty} onRemove={removeFromCart} onCheckout={handleCheckout} onInvoice={handleInvoice} checkoutLoading={checkoutMutation.isPending} invoiceLoading={invoiceMutation.isPending} />}
    </div>
  );
}
