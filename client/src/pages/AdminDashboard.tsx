/**
 * Red Dirt Blooms — Admin Dashboard
 * Owner-only control center: overview, gallery manager, harvest publisher,
 * subscriber manager, florist application review, orders, portfolio.
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Users, ShoppingBag, Flower2, Mail, CheckCircle, XCircle,
  Clock, ChevronRight, Loader2, BarChart3, BookOpen, Download,
  Leaf, Plus, Upload, Eye, EyeOff, Trash2, ImageIcon,
  GalleryHorizontal, Pencil, Save, X, Camera, Tag, Filter,
  MessageSquare, Phone, Globe, MapPin, Calendar, Star,
  Send, AlertCircle, RefreshCw, Megaphone
} from "lucide-react";
import { toast } from "sonner";

type TabKey = "overview" | "subscribers" | "orders" | "florists" | "harvest" | "portfolio" | "gallery" | "suggestions";

const GALLERY_CATEGORIES = ["The Farm", "Zinnias", "Dahlias", "Sunflowers", "Gomphrena", "Marigolds", "Celosia", "Arrangements", "Dried", "Seeds", "Other"];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");

  // ── Queries ──────────────────────────────────────────────────────────────
  const statsQuery = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const subscribersQuery = trpc.admin.getSubscribers.useQuery(undefined, { enabled: tab === "subscribers" && user?.role === "admin" });
  const ordersQuery = trpc.admin.getOrders.useQuery(undefined, { enabled: tab === "orders" && user?.role === "admin" });
  const floristsQuery = trpc.admin.getFloristApps.useQuery(undefined, { enabled: tab === "florists" && user?.role === "admin" });
  const harvestQuery = trpc.harvest.getAll.useQuery(undefined, { enabled: tab === "harvest" && user?.role === "admin" });
  const stripeSyncStatusQuery = trpc.stripeSync.getStatus.useQuery(undefined, { enabled: tab === "harvest" && user?.role === "admin" });
  const portfolioQuery = trpc.portfolio.getAll.useQuery(undefined, { enabled: tab === "portfolio" && user?.role === "admin" });
  const galleryQuery = trpc.gallery.getAll.useQuery(undefined, { enabled: tab === "gallery" && user?.role === "admin" });
  const suggestionsQuery = trpc.admin.getSuggestions.useQuery(undefined, { enabled: tab === "suggestions" && user?.role === "admin" });
  const updateSuggestionStatus = trpc.admin.updateSuggestionStatus.useMutation({
    onSuccess: () => suggestionsQuery.refetch(),
    onError: (err) => toast.error(err.message),
  });
  const syncAllToGHL = trpc.admin.syncAllFloristsToGHL.useMutation({
    onSuccess: (data) => toast.success(`GHL sync complete: ${data.synced} synced${data.failed > 0 ? `, ${data.failed} failed` : ""} (${data.total} total)`),
    onError: (err: any) => toast.error(`GHL sync failed: ${err.message}`),
  });

  // ── Harvest mutations ─────────────────────────────────────────────────────
  const setPublished = trpc.harvest.setPublished.useMutation({
    onSuccess: (_d, vars) => { toast.success(vars.published ? "Listing published — florists can see it." : "Listing unpublished."); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteListing = trpc.harvest.delete.useMutation({
    onSuccess: () => { toast.success("Listing deleted."); harvestQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const publishAndNotify = trpc.harvest.publishAndNotify.useMutation({
    onSuccess: (data) => { toast.success(`Published ${data.listingsPublished} listings, notified ${data.floristsNotified} florists!`); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const markSoldOut = trpc.harvest.markSoldOut.useMutation({
    onSuccess: (_d, vars) => { toast.success(vars.soldOut ? "Marked as sold out." : "Listing reopened — available again."); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const sendHarvestNotification = trpc.harvest.sendHarvestNotification.useMutation({
    onSuccess: (data) => { toast.success(`Harvest notification sent to ${data.subscribersNotified} Bloom Watch subscribers!`); setShowNotifModal(false); setNotifMessage(""); },
    onError: (err: any) => toast.error(err.message),
  });
  const syncListingToStripe = trpc.stripeSync.syncListing.useMutation({
    onSuccess: () => { toast.success("Listing synced to Stripe!"); stripeSyncStatusQuery.refetch(); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const bulkSyncToStripe = trpc.stripeSync.bulkSync.useMutation({
    onSuccess: (data) => { toast.success(`Synced ${data.successCount} listings to Stripe!`); stripeSyncStatusQuery.refetch(); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [showStripeSyncModal, setShowStripeSyncModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListing, setNewListing] = useState({ variety: "", color: "", description: "", pricePerBunch: "0", quantityAvailable: "", season: "", pricingTier: "premium" as "premium" | "specialty" | "focal", focalPrice: "" });
  const [uploadingPhotoId, setUploadingPhotoId] = useState<number | null>(null);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ variety: "", color: "", description: "", pricePerBunch: "0", quantityAvailable: "", season: "", pricingTier: "premium" as "premium" | "specialty" | "focal", focalPrice: "" });
  const updateListing = trpc.harvest.update.useMutation({
    onSuccess: () => { toast.success("Listing updated."); setEditingListingId(null); harvestQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  function startEdit(listing: any) {
    setEditingListingId(listing.id);
    setEditForm({
      variety: listing.variety ?? "",
      color: listing.color ?? "",
      description: listing.description ?? "",
      pricePerBunch: String(Number(listing.pricePerBunch).toFixed(2)),
      quantityAvailable: String(listing.quantityAvailable),
      season: listing.season ?? "",
      pricingTier: (listing.pricingTier ?? "premium") as "premium" | "specialty" | "focal",
      focalPrice: listing.focalPrice ? String(Number(listing.focalPrice).toFixed(2)) : "",
    });
  }
  const createListing = trpc.harvest.create.useMutation({
    onSuccess: () => { toast.success("Listing created."); setShowCreateForm(false); setNewListing({ variety: "", color: "", description: "", pricePerBunch: "0", quantityAvailable: "", season: "", pricingTier: "premium", focalPrice: "" }); harvestQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  async function handlePhotoUpload(listingId: number, file: File) {
    setUploadingPhotoId(listingId);
    try {
      const fd = new FormData(); fd.append("photo", file); fd.append("listingId", String(listingId));
      const res = await fetch("/api/harvest/upload-photo", { method: "POST", body: fd, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      toast.success("Photo uploaded!"); harvestQuery.refetch();
    } catch (err: any) { toast.error(err.message ?? "Upload failed."); }
    finally { setUploadingPhotoId(null); }
  }

  // ── Portfolio mutations ───────────────────────────────────────────────────
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", variety: "", season: "summer" as string, description: "", sortOrder: "0" });
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [editPortfolioData, setEditPortfolioData] = useState({ title: "", variety: "", season: "summer" as string, description: "", sortOrder: "0" });
  const [uploadingPortfolioPhotoId, setUploadingPortfolioPhotoId] = useState<number | null>(null);
  const createPortfolio = trpc.portfolio.create.useMutation({
    onSuccess: () => { toast.success("Portfolio item created."); setShowPortfolioForm(false); setNewPortfolio({ title: "", variety: "", season: "summer", description: "", sortOrder: "0" }); portfolioQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const updatePortfolio = trpc.portfolio.update.useMutation({
    onSuccess: () => { toast.success("Portfolio item updated."); setEditingPortfolioId(null); portfolioQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deletePortfolio = trpc.portfolio.delete.useMutation({
    onSuccess: () => { toast.success("Portfolio item deleted."); portfolioQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  async function handlePortfolioPhotoUpload(itemId: number, file: File) {
    setUploadingPortfolioPhotoId(itemId);
    try {
      const fd = new FormData(); fd.append("photo", file); fd.append("itemId", String(itemId));
      const res = await fetch("/api/portfolio/upload-photo", { method: "POST", body: fd, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      toast.success("Photo uploaded!"); portfolioQuery.refetch();
    } catch (err: any) { toast.error(err.message ?? "Upload failed."); }
    finally { setUploadingPortfolioPhotoId(null); }
  }

  // ── Florist app mutations ─────────────────────────────────────────────────
  const [floristFilter, setFloristFilter] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [expandedFloristId, setExpandedFloristId] = useState<string | null>(null);
  const [floristNotes, setFloristNotes] = useState<Record<string, string>>({});
  const updateFloristStatus = trpc.admin.updateFloristStatus.useMutation({
    onSuccess: () => { toast.success("Application status updated."); floristsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const saveFloristNotes = trpc.admin.saveFloristNotes.useMutation({
    onSuccess: () => { toast.success("Notes saved."); floristsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // ── Gallery mutations ─────────────────────────────────────────────────────
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [uploadingGalleryPhotoId, setUploadingGalleryPhotoId] = useState<number | null>(null);
  const [newGallery, setNewGallery] = useState({
    title: "", caption: "", category: "The Farm", variety: "",
    varietyLatin: "", varietyVaseLife: "", varietyStemLength: "",
    varietySeason: "", varietyDesignUse: "", varietyTags: "", varietyColor: "",
    sortOrder: "0", isPublished: true,
  });
  const [editGalleryData, setEditGalleryData] = useState({ ...newGallery });
  const createGallery = trpc.gallery.create.useMutation({
    onSuccess: () => { toast.success("Gallery item created."); setShowGalleryForm(false); setNewGallery({ title: "", caption: "", category: "The Farm", variety: "", varietyLatin: "", varietyVaseLife: "", varietyStemLength: "", varietySeason: "", varietyDesignUse: "", varietyTags: "", varietyColor: "", sortOrder: "0", isPublished: true }); galleryQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const updateGallery = trpc.gallery.update.useMutation({
    onSuccess: () => { toast.success("Gallery item updated."); setEditingGalleryId(null); galleryQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteGallery = trpc.gallery.delete.useMutation({
    onSuccess: () => { toast.success("Gallery item deleted."); galleryQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const setGalleryPublished = trpc.gallery.setPublished.useMutation({
    onSuccess: (_d, vars) => { toast.success(vars.published ? "Photo published." : "Photo hidden."); galleryQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  async function handleGalleryPhotoUpload(photoId: number, file: File) {
    setUploadingGalleryPhotoId(photoId);
    try {
      const fd = new FormData(); fd.append("photo", file); fd.append("photoId", String(photoId));
      const res = await fetch("/api/gallery/upload-photo", { method: "POST", body: fd, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      toast.success("Photo uploaded!"); galleryQuery.refetch();
    } catch (err: any) { toast.error(err.message ?? "Upload failed."); }
    finally { setUploadingGalleryPhotoId(null); }
  }

  // ── Subscriber filter ─────────────────────────────────────────────────────
  const [subSearch, setSubSearch] = useState("");

  // ── Confirmation dialog ───────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });
  function showConfirm(opts: { title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }) {
    setConfirmDialog({ open: true, ...opts });
  }
  function closeConfirm() { setConfirmDialog(d => ({ ...d, open: false })); }

  // ── Preview modal ─────────────────────────────────────────────────────────
  const [previewItem, setPreviewItem] = useState<{
    type: "listing" | "gallery";
    title: string;
    description?: string;
    price?: string;
    quantity?: string;
    season?: string;
    imageUrl?: string;
    category?: string;
    variety?: string;
    tags?: string;
  } | null>(null);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Flower2 className="w-12 h-12 text-[#B5451B]/30 mx-auto mb-4" />
          <h2 className="font-heading text-[#2A1F1A] font-bold text-2xl mb-2">Admin Only</h2>
          <p className="font-body text-[#2A1F1A]/50 text-sm mb-4">You need admin access to view this page.</p>
          <Link href="/" className="font-body text-sm text-[#B5451B] hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview",     label: "Overview",     icon: <BarChart3 className="w-4 h-4" /> },
    { key: "gallery",      label: "Gallery",       icon: <Camera className="w-4 h-4" /> },
    { key: "harvest",      label: "Harvest",       icon: <Leaf className="w-4 h-4" /> },
    { key: "subscribers",  label: "Subscribers",   icon: <Mail className="w-4 h-4" /> },
    { key: "florists",     label: "Florist Apps",  icon: <Flower2 className="w-4 h-4" /> },
    { key: "orders",       label: "Orders",        icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "portfolio",    label: "Portfolio",     icon: <GalleryHorizontal className="w-4 h-4" /> },
    { key: "suggestions",  label: "Suggestions",   icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Filtered data
  const filteredSubs = (subscribersQuery.data ?? []).filter(s =>
    !subSearch || s.email.toLowerCase().includes(subSearch.toLowerCase())
  );
  const filteredFlorists = (floristsQuery.data ?? []).filter(a =>
    floristFilter === "all" || a.status === floristFilter
  );
  const filteredGallery = galleryFilter === "All"
    ? (galleryQuery.data ?? [])
    : (galleryQuery.data ?? []).filter(p => p.category === galleryFilter);

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-[#2A1F1A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-accent text-[#E8A020] text-sm mb-1">Farm Control Center</div>
              <h1 className="font-heading text-[#F5F0E8] font-bold text-2xl">Admin Dashboard</h1>
            </div>
            <Link href="/diary-admin" className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body text-sm font-semibold px-4 py-2 rounded transition-colors">
              <BookOpen className="w-4 h-4" /> Bloom Diary <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#B5451B]/10 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 min-w-max">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-4 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key ? "border-[#B5451B] text-[#B5451B]" : "border-transparent text-[#2A1F1A]/50 hover:text-[#2A1F1A]"
                }`}
              >
                {t.icon} {t.label}
                {t.key === "florists" && (stats?.floristApps ?? 0) > 0 && (
                  <span className="bg-[#B5451B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats?.floristApps}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div>
            {statsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Bloom Watch Subscribers", value: stats?.subscribers ?? 0, icon: <Mail className="w-6 h-6" />, color: "#7A8C6E", action: () => setTab("subscribers") },
                  { label: "Total Orders", value: stats?.orders ?? 0, icon: <ShoppingBag className="w-6 h-6" />, color: "#B5451B", action: () => setTab("orders") },
                  { label: "Pending Florist Apps", value: stats?.floristApps ?? 0, icon: <Flower2 className="w-6 h-6" />, color: "#E8A020", action: () => setTab("florists") },
                  { label: "Diary Posts", value: stats?.diaryPosts ?? 0, icon: <BookOpen className="w-6 h-6" />, color: "#9B8EA0", action: () => { window.location.href = "/diary-admin"; } },
                ].map((s, idx) => (
                  <button key={s.label} onClick={s.action}
                    className="bg-white rounded border border-[#B5451B]/10 p-6 text-left hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: s.color + "20", color: s.color }}>{s.icon}</div>
                      <ChevronRight className="w-4 h-4 text-[#2A1F1A]/20 group-hover:text-[#B5451B] transition-colors" />
                    </div>
                    <div className="font-heading text-[#2A1F1A] font-bold text-3xl mb-1">{s.value}</div>
                    <div className="font-body text-[#2A1F1A]/50 text-xs">{s.label}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-8 bg-white rounded border border-[#B5451B]/10 p-6">
              <h3 className="font-heading text-[#2A1F1A] font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: <Camera className="w-5 h-5 text-[#B5451B]" />, label: "Gallery Manager", sub: "Upload & tag photos", action: () => setTab("gallery") },
                  { icon: <Megaphone className="w-5 h-5 text-[#7A8C6E]" />, label: "Publish Harvest", sub: "Notify florists", action: () => setTab("harvest") },
                  { icon: <Users className="w-5 h-5 text-[#E8A020]" />, label: "View Subscribers", sub: "Bloom Watch list", action: () => setTab("subscribers") },
                  { icon: <Flower2 className="w-5 h-5 text-[#9B8EA0]" />, label: "Review Florist Apps", sub: "Approve or decline", action: () => setTab("florists") },
                ].map((qa) => (
                  <button key={qa.label} onClick={qa.action}
                    className="flex items-center gap-3 bg-[#F5F0E8] hover:bg-[#B5451B]/5 rounded p-4 transition-colors text-left"
                  >
                    {qa.icon}
                    <div>
                      <div className="font-body text-sm font-semibold text-[#2A1F1A]">{qa.label}</div>
                      <div className="font-body text-xs text-[#2A1F1A]/40">{qa.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GALLERY MANAGER ───────────────────────────────────────────────── */}
        {tab === "gallery" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Gallery Manager</h2>
                <p className="font-body text-xs text-[#2A1F1A]/40 mt-0.5">Photos uploaded here appear on the public /gallery page.</p>
              </div>
              <button onClick={() => setShowGalleryForm(!showGalleryForm)}
                className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Photo
              </button>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["All", ...GALLERY_CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setGalleryFilter(cat)}
                  className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    galleryFilter === cat ? "bg-[#B5451B] text-white border-[#B5451B]" : "bg-white text-[#2A1F1A]/50 border-[#B5451B]/20 hover:border-[#B5451B]/50"
                  }`}
                >{cat}</button>
              ))}
            </div>

            {/* Create form */}
            {showGalleryForm && (
              <div className="bg-white rounded border border-[#B5451B]/10 p-5 mb-6">
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-base mb-4">New Gallery Photo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "Title *", key: "title", placeholder: "e.g. Zinnia Mix at Golden Hour" },
                    { label: "Variety", key: "variety", placeholder: "e.g. Zinnia elegans" },
                    { label: "Latin Name", key: "varietyLatin", placeholder: "e.g. Zinnia elegans 'Benary Giant'" },
                    { label: "Vase Life", key: "varietyVaseLife", placeholder: "e.g. 7–10 days" },
                    { label: "Stem Length", key: "varietyStemLength", placeholder: "e.g. 18–24 inches" },
                    { label: "Season", key: "varietySeason", placeholder: "e.g. Summer, Fall" },
                    { label: "Design Use", key: "varietyDesignUse", placeholder: "e.g. Focal flower, filler" },
                    { label: "Tags (comma-sep)", key: "varietyTags", placeholder: "e.g. bold, colorful, fragrant" },
                    { label: "Accent Color (hex)", key: "varietyColor", placeholder: "#E8A020" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">{f.label}</label>
                      <input className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                        value={(newGallery as any)[f.key]} onChange={e => setNewGallery(g => ({ ...g, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Category</label>
                    <select className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newGallery.category} onChange={e => setNewGallery(g => ({ ...g, category: e.target.value }))}>
                      {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Sort Order</label>
                    <input type="number" className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newGallery.sortOrder} onChange={e => setNewGallery(g => ({ ...g, sortOrder: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Caption</label>
                    <textarea rows={2} className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                      value={newGallery.caption} onChange={e => setNewGallery(g => ({ ...g, caption: e.target.value }))} placeholder="Optional caption shown in gallery" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pub-new" checked={newGallery.isPublished} onChange={e => setNewGallery(g => ({ ...g, isPublished: e.target.checked }))} className="rounded" />
                    <label htmlFor="pub-new" className="font-body text-sm text-[#2A1F1A]">Publish immediately</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => {
                    if (!newGallery.title) { toast.error("Title is required."); return; }
                    createGallery.mutate({ ...newGallery, sortOrder: parseInt(newGallery.sortOrder) || 0 });
                  }} disabled={createGallery.isPending}
                    className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                  >
                    {createGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                  </button>
                  <button onClick={() => setShowGalleryForm(false)} className="font-body text-sm text-[#2A1F1A]/40 hover:text-[#2A1F1A] px-4 py-2 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {galleryQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : filteredGallery.length === 0 ? (
              <div className="bg-white rounded border border-[#B5451B]/10 px-5 py-10 text-center">
                <Camera className="w-10 h-10 text-[#2A1F1A]/20 mx-auto mb-3" />
                <p className="font-body text-sm text-[#2A1F1A]/40">No gallery photos yet. Add your first photo above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGallery.map((photo) => (
                  <div key={photo.id} className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                    {/* Photo area */}
                    <div className="relative h-44 bg-[#F5F0E8] flex items-center justify-center">
                      {photo.imageUrl ? (
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-[#2A1F1A]/20" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleGalleryPhotoUpload(photo.id, f); e.target.value = ""; }} />
                        {uploadingGalleryPhotoId === photo.id ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                            <span className="text-white text-xs font-body">{photo.imageUrl ? "Replace Photo" : "Upload Photo"}</span>
                          </div>
                        )}
                      </label>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 text-stone-700">{photo.category}</span>
                        {!photo.isPublished && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Hidden</span>}
                      </div>
                    </div>

                    {/* Info / Edit */}
                    <div className="p-4">
                      {editingGalleryId === photo.id ? (
                        <div className="space-y-2">
                          <input className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editGalleryData.title} onChange={e => setEditGalleryData(g => ({ ...g, title: e.target.value }))} placeholder="Title" />
                          <input className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editGalleryData.variety} onChange={e => setEditGalleryData(g => ({ ...g, variety: e.target.value }))} placeholder="Variety name" />
                          <div className="grid grid-cols-2 gap-2">
                            <input className="border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              value={editGalleryData.varietyVaseLife} onChange={e => setEditGalleryData(g => ({ ...g, varietyVaseLife: e.target.value }))} placeholder="Vase life" />
                            <input className="border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              value={editGalleryData.varietyStemLength} onChange={e => setEditGalleryData(g => ({ ...g, varietyStemLength: e.target.value }))} placeholder="Stem length" />
                          </div>
                          <input className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editGalleryData.varietyTags} onChange={e => setEditGalleryData(g => ({ ...g, varietyTags: e.target.value }))} placeholder="Tags (comma-separated)" />
                          <select className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editGalleryData.category} onChange={e => setEditGalleryData(g => ({ ...g, category: e.target.value }))}>
                            {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <textarea rows={2} className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                            value={editGalleryData.caption} onChange={e => setEditGalleryData(g => ({ ...g, caption: e.target.value }))} placeholder="Caption" />
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => updateGallery.mutate({ id: photo.id, ...editGalleryData, sortOrder: parseInt(editGalleryData.sortOrder) || 0 })}
                              disabled={updateGallery.isPending}
                              className="flex items-center gap-1 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                            >
                              {updateGallery.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                            </button>
                            <button onClick={() => setEditingGalleryId(null)} className="flex items-center gap-1 font-body text-xs px-3 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-heading text-[#2A1F1A] font-semibold text-sm leading-tight">{photo.title}</h3>
                          {photo.variety && <p className="text-xs text-[#B5451B] font-medium mt-0.5">{photo.variety}</p>}
                          {photo.caption && <p className="text-xs text-[#2A1F1A]/50 mt-1 line-clamp-2">{photo.caption}</p>}
                          {photo.varietyTags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {photo.varietyTags.split(",").slice(0, 3).map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#F5F0E8] text-[#2A1F1A]/50 rounded">{t.trim()}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => {
                              setEditingGalleryId(photo.id);
                              setEditGalleryData({ title: photo.title, caption: photo.caption ?? "", category: photo.category, variety: photo.variety ?? "", varietyLatin: photo.varietyLatin ?? "", varietyVaseLife: photo.varietyVaseLife ?? "", varietyStemLength: photo.varietyStemLength ?? "", varietySeason: photo.varietySeason ?? "", varietyDesignUse: photo.varietyDesignUse ?? "", varietyTags: photo.varietyTags ?? "", varietyColor: photo.varietyColor ?? "", sortOrder: String(photo.sortOrder), isPublished: photo.isPublished });
                            }} className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => setGalleryPublished.mutate({ id: photo.id, published: !photo.isPublished })}
                              disabled={setGalleryPublished.isPending}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors disabled:opacity-60"
                            >
                              {photo.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {photo.isPublished ? "Hide" : "Show"}
                            </button>
                            <button onClick={() => showConfirm({ title: "Delete Photo", message: `Delete "${photo.title}" permanently? This cannot be undone.`, confirmLabel: "Delete", danger: true, onConfirm: () => deleteGallery.mutate({ id: photo.id }) })}
                              disabled={deleteGallery.isPending}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HARVEST PUBLISHER ─────────────────────────────────────────────── */}
        {tab === "harvest" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Harvest Publisher</h2>
                <p className="font-body text-xs text-[#2A1F1A]/40 mt-0.5">Create listings, publish individually, sync to Stripe, or blast all draft listings to florists at once.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stripeSyncStatusQuery.data && stripeSyncStatusQuery.data.unsynced > 0 && (
                  <button onClick={() => setShowStripeSyncModal(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Sync {stripeSyncStatusQuery.data.unsynced} to Stripe
                  </button>
                )}
                <button onClick={() => setShowNotifModal(true)}
                  className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
                >
                  <Send className="w-4 h-4" /> Notify Bloom Watch
                </button>
                <button onClick={() => {
                  const drafts = (harvestQuery.data ?? []).filter(l => !l.isPublished).map(l => l.id);
                  if (drafts.length === 0) { toast("No draft listings to publish."); return; }
                  showConfirm({ title: "Publish All & Notify Florists", message: `Publish all ${drafts.length} draft listings and send harvest notification to all approved florists?`, confirmLabel: "Publish & Notify", onConfirm: () => publishAndNotify.mutate({ listingIds: drafts }) });
                }} disabled={publishAndNotify.isPending}
                  className="flex items-center gap-2 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                >
                  {publishAndNotify.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  Publish All & Notify Florists
                </button>
                <button onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Listing
                </button>
              </div>
            </div>

            {/* Stripe Sync Status Modal */}
            {showStripeSyncModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-[#2A1F1A] font-bold text-lg">Sync Listings to Stripe</h3>
                    <button onClick={() => setShowStripeSyncModal(false)} className="text-[#2A1F1A]/40 hover:text-[#2A1F1A]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="font-body text-[#2A1F1A]/60 text-sm mb-4">
                    This will sync all unsynced listings to Stripe and create products with the naming convention: {`{Variety}-{Color}-{StemSize}Stem-{Tier} Bunch`}
                  </p>
                  {stripeSyncStatusQuery.data && (
                    <div className="bg-[#F5F0E8] rounded p-3 mb-4 font-body text-xs text-[#2A1F1A]/70">
                      <p><strong>Total listings:</strong> {stripeSyncStatusQuery.data.total}</p>
                      <p><strong>Already synced:</strong> {stripeSyncStatusQuery.data.synced}</p>
                      <p><strong>Ready to sync:</strong> {stripeSyncStatusQuery.data.unsynced}</p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowStripeSyncModal(false)} className="font-body text-sm px-4 py-2 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        bulkSyncToStripe.mutate({});
                        setShowStripeSyncModal(false);
                      }}
                      disabled={bulkSyncToStripe.isPending}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                    >
                      {bulkSyncToStripe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Send Harvest Notification Modal */}
            {showNotifModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-[#2A1F1A] font-bold text-lg">Notify Bloom Watch Subscribers</h3>
                    <button onClick={() => setShowNotifModal(false)} className="text-[#2A1F1A]/40 hover:text-[#2A1F1A]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="font-body text-[#2A1F1A]/60 text-sm mb-4">
                    This will send a harvest notification to all active Bloom Watch subscribers. The notification includes a summary of all currently published, available listings.
                  </p>
                  <div className="mb-4">
                    <label className="font-body text-xs font-semibold text-[#2A1F1A]/60 uppercase tracking-wide block mb-1">Optional Custom Message</label>
                    <textarea
                      value={notifMessage}
                      onChange={e => setNotifMessage(e.target.value)}
                      placeholder="Add a personal note to subscribers (optional)..."
                      rows={3}
                      className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowNotifModal(false)} className="font-body text-sm px-4 py-2 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => sendHarvestNotification.mutate({ message: notifMessage || undefined })}
                      disabled={sendHarvestNotification.isPending}
                      className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                    >
                      {sendHarvestNotification.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create form */}
            {showCreateForm && (
              <div className="bg-white rounded border border-[#B5451B]/10 p-5 mb-6">
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-base mb-4">New Harvest Listing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Variety *</label>
                    <input className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newListing.variety} onChange={e => setNewListing(l => ({ ...l, variety: e.target.value }))} placeholder="e.g. Gaura" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Color *</label>
                    <input className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newListing.color} onChange={e => setNewListing(l => ({ ...l, color: e.target.value }))} placeholder="e.g. Pink" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Pricing Tier *</label>
                    <select className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] bg-white"
                      value={newListing.pricingTier} onChange={e => setNewListing(l => ({ ...l, pricingTier: e.target.value as any }))}>
                      <option value="premium">Premium — $5 / $9 / $12</option>
                      <option value="specialty">Specialty — $9 / $15 / $21</option>
                      <option value="focal">Focal / Market Price</option>
                    </select>
                  </div>
                  {newListing.pricingTier === "focal" && (
                    <div>
                      <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Focal Price ($) *</label>
                      <input type="number" step="0.01" className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                        value={newListing.focalPrice} onChange={e => setNewListing(l => ({ ...l, focalPrice: e.target.value }))} placeholder="e.g. 14.00" />
                    </div>
                  )}
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Quantity Available *</label>
                    <input type="number" className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newListing.quantityAvailable} onChange={e => setNewListing(l => ({ ...l, quantityAvailable: e.target.value }))} placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Season</label>
                    <input className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newListing.season} onChange={e => setNewListing(l => ({ ...l, season: e.target.value }))} placeholder="e.g. Summer 2025" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Description</label>
                    <textarea rows={2} className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                      value={newListing.description} onChange={e => setNewListing(l => ({ ...l, description: e.target.value }))} placeholder="Optional notes for florists" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => {
                    if (!newListing.variety || !newListing.color || !newListing.quantityAvailable) { toast.error("Variety, color, and quantity are required."); return; }
                    if (newListing.pricingTier === "focal" && !newListing.focalPrice) { toast.error("Focal price is required for focal tier."); return; }
                    const tierPrice = newListing.pricingTier === "premium" ? 5 : newListing.pricingTier === "specialty" ? 9 : parseFloat(newListing.focalPrice || "0");
                    createListing.mutate({
                      variety: newListing.variety,
                      color: newListing.color,
                      description: newListing.description || undefined,
                      pricePerBunch: tierPrice,
                      quantityAvailable: parseInt(newListing.quantityAvailable),
                      season: newListing.season || undefined,
                      pricingTier: newListing.pricingTier,
                      focalPrice: newListing.focalPrice ? parseFloat(newListing.focalPrice) : undefined,
                    });
                  }} disabled={createListing.isPending}
                    className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                  >
                    {createListing.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Listing
                  </button>
                  <button onClick={() => setShowCreateForm(false)} className="font-body text-sm text-[#2A1F1A]/40 hover:text-[#2A1F1A] px-4 py-2 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {harvestQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (harvestQuery.data ?? []).length === 0 ? (
              <div className="bg-white rounded border border-[#B5451B]/10 px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">No listings yet. Create your first harvest listing above.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(harvestQuery.data ?? []).map((listing) => (
                  <div key={listing.id} className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                    <div className="relative h-40 bg-[#F5F0E8] flex items-center justify-center">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt={listing.variety} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-[#2A1F1A]/20" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(listing.id, f); e.target.value = ""; }} />
                        {uploadingPhotoId === listing.id ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                            <span className="text-white text-xs font-body">{listing.imageUrl ? "Replace Photo" : "Upload Photo"}</span>
                          </div>
                        )}
                      </label>
                    </div>
                    <div className="p-4">
                      {editingListingId === listing.id ? (
                        /* ── Inline Edit Form ── */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-heading text-[#2A1F1A] font-semibold text-sm">Edit Listing</span>
                            <button onClick={() => setEditingListingId(null)} className="text-[#2A1F1A]/30 hover:text-[#2A1F1A] transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                          {[
                            { key: "variety", label: "Variety", type: "text", placeholder: "e.g. Gaura" },
                            { key: "color", label: "Color", type: "text", placeholder: "e.g. Pink" },
                            { key: "quantityAvailable", label: "Qty Available", type: "number", placeholder: "25" },
                            { key: "season", label: "Season", type: "text", placeholder: "Summer 2025" },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/40 block mb-0.5">{f.label}</label>
                              <input type={f.type} placeholder={f.placeholder}
                                value={(editForm as any)[f.key]}
                                onChange={e => setEditForm(ef => ({ ...ef, [f.key]: e.target.value }))}
                                className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              />
                            </div>
                          ))}
                          <div>
                            <label className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/40 block mb-0.5">Pricing Tier</label>
                            <select className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] bg-white"
                              value={editForm.pricingTier} onChange={e => setEditForm(ef => ({ ...ef, pricingTier: e.target.value as any }))}>
                              <option value="premium">Premium — $5/$9/$12</option>
                              <option value="specialty">Specialty — $9/$15/$21</option>
                              <option value="focal">Focal / Market</option>
                            </select>
                          </div>
                          {editForm.pricingTier === "focal" && (
                            <div>
                              <label className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/40 block mb-0.5">Focal Price ($)</label>
                              <input type="number" step="0.01" placeholder="14.00"
                                value={editForm.focalPrice}
                                onChange={e => setEditForm(ef => ({ ...ef, focalPrice: e.target.value }))}
                                className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              />
                            </div>
                          )}
                          <div>
                            <label className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/40 block mb-0.5">Notes for Florists</label>
                            <textarea rows={2} placeholder="Optional notes"
                              value={editForm.description}
                              onChange={e => setEditForm(ef => ({ ...ef, description: e.target.value }))}
                              className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-xs text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                if (!editForm.variety || !editForm.color || !editForm.quantityAvailable) { toast.error("Variety, color, and quantity are required."); return; }
                                if (editForm.pricingTier === "focal" && !editForm.focalPrice) { toast.error("Focal price is required for focal tier."); return; }
                                const tierPrice = editForm.pricingTier === "premium" ? 5 : editForm.pricingTier === "specialty" ? 9 : parseFloat(editForm.focalPrice || "0");
                                updateListing.mutate({
                                  id: listing.id,
                                  variety: editForm.variety,
                                  color: editForm.color,
                                  description: editForm.description || undefined,
                                  pricePerBunch: tierPrice,
                                  quantityAvailable: parseInt(editForm.quantityAvailable),
                                  season: editForm.season || undefined,
                                  pricingTier: editForm.pricingTier,
                                  focalPrice: editForm.focalPrice ? parseFloat(editForm.focalPrice) : undefined,
                                });
                              }}
                              disabled={updateListing.isPending}
                              className="flex items-center gap-1 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                            >
                              {updateListing.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                            </button>
                            <button onClick={() => setEditingListingId(null)}
                              className="font-body text-xs px-3 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors"
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        /* ── Read Mode ── */
                        <>
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-heading text-[#2A1F1A] font-semibold text-sm">{listing.variety}</h3>
                            <div className="flex items-center gap-1.5">
                              {listing.isSoldOut && (
                                <span className="font-body text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-500">Sold Out</span>
                              )}
                              <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded ${listing.isPublished ? "bg-[#7A8C6E]/10 text-[#7A8C6E]" : "bg-[#E8A020]/10 text-[#E8A020]"}`}>
                                {listing.isPublished ? "Live" : "Draft"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 font-body text-xs text-[#2A1F1A]/50 mb-3">
                            {listing.pricingTier === "premium" && <span className="font-semibold text-[#7A8C6E]">Premium — $5/$9/$12</span>}
                            {listing.pricingTier === "specialty" && <span className="font-semibold text-[#B5451B]">Specialty — $9/$15/$21</span>}
                            {listing.pricingTier === "focal" && <span className="font-semibold text-[#E8A020]">Focal — ${Number(listing.focalPrice ?? listing.pricePerBunch).toFixed(2)}</span>}
                            {!listing.pricingTier && <span>${Number(listing.pricePerBunch).toFixed(2)}/bunch</span>}
                            <span>{listing.quantityAvailable - listing.quantitySold} of {listing.quantityAvailable} left</span>
                            {listing.season && <span className="text-[#2A1F1A]/30">{listing.season}</span>}
                          </div>
                          {listing.description && (
                            <p className="font-body text-xs text-[#2A1F1A]/50 mb-3 leading-relaxed">{listing.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {!listing.syncedToStripe && (
                              <button onClick={() => syncListingToStripe.mutate({ listingId: listing.id })}
                                disabled={syncListingToStripe.isPending}
                                className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-60"
                              >
                                {syncListingToStripe.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Sync to Stripe
                              </button>
                            )}
                            {listing.syncedToStripe && (
                              <span className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded bg-green-50 text-green-600 font-semibold">
                                ✓ Synced
                              </span>
                            )}
                            <button onClick={() => startEdit(listing)}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#B5451B]/20 text-[#B5451B] hover:bg-[#B5451B]/5 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            {listing.isPublished ? (
                              <button onClick={() => setPublished.mutate({ id: listing.id, published: false })} disabled={setPublished.isPending}
                                className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors disabled:opacity-60"
                              >
                                <EyeOff className="w-3.5 h-3.5" /> Unpublish
                              </button>
                            ) : (
                              <button onClick={() => setPublished.mutate({ id: listing.id, published: true })} disabled={setPublished.isPending}
                                className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white transition-colors disabled:opacity-60"
                              >
                                <Eye className="w-3.5 h-3.5" /> Publish
                              </button>
                            )}
                            {listing.isSoldOut ? (
                              <button onClick={() => markSoldOut.mutate({ id: listing.id, soldOut: false })} disabled={markSoldOut.isPending}
                                className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#7A8C6E]/30 text-[#7A8C6E] hover:bg-[#7A8C6E]/5 transition-colors disabled:opacity-60"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Reopen
                              </button>
                            ) : (
                              <button onClick={() => markSoldOut.mutate({ id: listing.id, soldOut: true })} disabled={markSoldOut.isPending}
                                className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-60"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Sold Out
                              </button>
                            )}
                            <button onClick={() => showConfirm({ title: "Delete Listing", message: `Delete the "${listing.variety}" listing permanently?`, confirmLabel: "Delete", danger: true, onConfirm: () => deleteListing.mutate({ id: listing.id }) })}
                              disabled={deleteListing.isPending}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIBERS ───────────────────────────────────────────────────── */}
        {tab === "subscribers" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Bloom Watch Subscribers</h2>
                <p className="font-body text-xs text-[#2A1F1A]/40 mt-0.5">{subscribersQuery.data?.length ?? 0} total subscribers</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text" placeholder="Search by email…"
                  value={subSearch} onChange={e => setSubSearch(e.target.value)}
                  className="border border-[#B5451B]/20 rounded px-3 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] w-48"
                />
                {(subscribersQuery.data?.length ?? 0) > 0 && (
                  <button onClick={() => {
                    const rows = subscribersQuery.data ?? [];
                    const csv = ["Email,Name,Source,Signed Up", ...rows.map(s => `${s.email},${s.name ?? ""},${s.source ?? "homepage"},${new Date(s.createdAt).toLocaleDateString()}`)].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `bloom-watch-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                  }} className="flex items-center gap-1.5 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                )}
                <button onClick={() => subscribersQuery.refetch()} className="p-1.5 text-[#2A1F1A]/30 hover:text-[#2A1F1A] transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {subscribersQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (
              <div className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                <div className="grid grid-cols-4 bg-[#2A1F1A] px-5 py-3">
                  {["Email", "Name", "Source", "Signed Up"].map(h => (
                    <div key={h} className="font-body text-xs font-semibold text-[#E8A020] uppercase tracking-wide">{h}</div>
                  ))}
                </div>
                {filteredSubs.length === 0 ? (
                  <div className="px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">
                    {subSearch ? "No subscribers match your search." : "No subscribers yet — share the Bloom Watch link!"}
                  </div>
                ) : (
                  filteredSubs.map((s, i) => (
                    <div key={s.id} className={`grid grid-cols-4 px-5 py-3 border-b border-[#B5451B]/5 ${i % 2 === 0 ? "bg-white" : "bg-[#F5F0E8]/50"}`}>
                      <div className="font-body text-sm text-[#2A1F1A] truncate">{s.email}</div>
                      <div className="font-body text-xs text-[#2A1F1A]/60 truncate">{s.name ?? "—"}</div>
                      <div className="font-body text-xs text-[#7A8C6E] capitalize">{s.source?.replace(/-/g, " ") ?? "homepage"}</div>
                      <div className="font-body text-xs text-[#2A1F1A]/40">{new Date(s.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FLORIST APPLICATIONS ──────────────────────────────────────────── */}
        {tab === "florists" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Florist Applications</h2>
                <p className="font-body text-xs text-[#2A1F1A]/40 mt-0.5">{floristsQuery.data?.length ?? 0} total</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => syncAllToGHL.mutate()}
                  disabled={syncAllToGHL.isPending}
                  className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-full border border-[#2A7A4B]/40 bg-[#2A7A4B]/10 text-[#2A7A4B] hover:bg-[#2A7A4B]/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncAllToGHL.isPending ? "animate-spin" : ""}`} />
                  {syncAllToGHL.isPending ? "Syncing..." : "Sync All to GHL"}
                </button>
                {(["all", "pending", "approved", "declined"] as const).map(f => (
                  <button key={f} onClick={() => setFloristFilter(f)}
                    className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                      floristFilter === f ? "bg-[#B5451B] text-white border-[#B5451B]" : "bg-white text-[#2A1F1A]/50 border-[#B5451B]/20 hover:border-[#B5451B]/50"
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {floristsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : filteredFlorists.length === 0 ? (
              <div className="bg-white rounded border border-[#B5451B]/10 px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">No applications match this filter.</div>
            ) : (
              <div className="space-y-4">
                {filteredFlorists.map((app) => (
                  <div key={app.id} className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-heading text-[#2A1F1A] font-semibold text-base">{app.businessName}</h3>
                          <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                            app.status === "approved" ? "bg-[#7A8C6E]/10 text-[#7A8C6E]" :
                            app.status === "declined" ? "bg-red-50 text-red-500" :
                            "bg-[#E8A020]/10 text-[#E8A020]"
                          }`}>{app.status}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs font-body text-[#2A1F1A]/50">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {app.contactName}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                          {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>}
                          {app.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.city}</span>}
                          {(app as any).monthlyVolume && <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {(app as any).monthlyVolume}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {app.status === "pending" && (
                          <>
                            <button onClick={() => updateFloristStatus.mutate({ email: app.email, status: "approved", adminNotes: floristNotes[app.email] })}
                              disabled={updateFloristStatus.isPending}
                              className="flex items-center gap-1.5 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => updateFloristStatus.mutate({ email: app.email, status: "declined", adminNotes: floristNotes[app.email] })}
                              disabled={updateFloristStatus.isPending}
                              className="flex items-center gap-1.5 bg-[#F5F0E8] hover:bg-red-50 text-[#2A1F1A]/60 hover:text-red-500 font-body text-xs font-semibold px-3 py-1.5 rounded border border-[#B5451B]/10 transition-colors disabled:opacity-60"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpandedFloristId(expandedFloristId === app.email ? null : app.email)}
                          className="font-body text-xs px-2 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors"
                        >
                          {expandedFloristId === app.email ? "Less" : "Details"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {expandedFloristId === app.email && (
                      <div className="border-t border-[#B5451B]/10 px-5 py-4 bg-[#F5F0E8]/40">
                        {(app as any).message && (
                          <div className="mb-4">
                            <div className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide mb-1">Message from applicant</div>
                            <p className="font-body text-sm text-[#2A1F1A]/70 bg-white rounded p-3 border border-[#B5451B]/10">{(app as any).message}</p>
                          </div>
                        )}
                        {(app as any).flowerTypes && (
                          <div className="mb-4">
                            <div className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide mb-1">Flower types interested in</div>
                            <p className="font-body text-sm text-[#2A1F1A]/70">{(app as any).flowerTypes}</p>
                          </div>
                        )}
                        <div>
                          <div className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide mb-1">Admin Notes</div>
                          <textarea rows={3} className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none bg-white"
                            placeholder="Internal notes about this application…"
                            value={floristNotes[app.email as string] ?? (app.adminNotes ?? "")}
                            onChange={e => setFloristNotes(n => ({ ...n, [app.email as string]: e.target.value }))}
                          />
                          <button onClick={() => saveFloristNotes.mutate({ email: app.email, adminNotes: floristNotes[app.email as string] ?? (app.adminNotes ?? "") })}
                            disabled={saveFloristNotes.isPending}
                            className="mt-2 flex items-center gap-1.5 bg-[#2A1F1A] hover:bg-[#3a2f2a] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                          >
                            {saveFloristNotes.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Notes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ────────────────────────────────────────────────────────── */}
        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Orders</h2>
              <span className="font-body text-sm text-[#2A1F1A]/40">{ordersQuery.data?.length ?? 0} total</span>
            </div>
            {ordersQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (
              <div className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                <div className="grid grid-cols-5 bg-[#2A1F1A] px-5 py-3">
                  {["Customer", "Product", "Amount", "Status", "Date"].map(h => (
                    <div key={h} className="font-body text-xs font-semibold text-[#E8A020] uppercase tracking-wide">{h}</div>
                  ))}
                </div>
                {(ordersQuery.data ?? []).length === 0 ? (
                  <div className="px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">No orders yet — share the Harvest Stand!</div>
                ) : (
                  (ordersQuery.data ?? []).map((o, i) => (
                    <div key={o.id} className={`grid grid-cols-5 px-5 py-3 border-b border-[#B5451B]/5 ${i % 2 === 0 ? "bg-white" : "bg-[#F5F0E8]/50"}`}>
                      <div className="font-body text-sm text-[#2A1F1A] truncate">{o.customerEmail ?? "—"}</div>
                      <div className="font-body text-xs text-[#2A1F1A]/60 truncate">{o.productName ?? "—"}</div>
                      <div className="font-body text-sm font-semibold text-[#B5451B]">{o.amountCents ? `$${(o.amountCents / 100).toFixed(2)}` : "—"}</div>
                      <div>
                        <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                          o.status === "paid" ? "bg-[#7A8C6E]/10 text-[#7A8C6E]" :
                          o.status === "fulfilled" ? "bg-[#2A1F1A]/10 text-[#2A1F1A]" :
                          o.status === "cancelled" ? "bg-red-50 text-red-500" :
                          "bg-[#E8A020]/10 text-[#E8A020]"
                        }`}>{o.status}</span>
                      </div>
                      <div className="font-body text-xs text-[#2A1F1A]/40">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
        {tab === "suggestions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Florist Suggestions</h2>
            </div>
            {suggestionsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (suggestionsQuery.data ?? []).length === 0 ? (
              <div className="bg-white rounded border border-[#B5451B]/10 px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">No suggestions yet.</div>
            ) : (
              <div className="space-y-3">
                {(suggestionsQuery.data ?? []).map((s: any) => (
                  <div key={s.id} className="bg-white rounded border border-[#B5451B]/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#B5451B]/10 text-[#B5451B] capitalize">
                            {s.category.replace("-", " ")}
                          </span>
                          <span className="text-xs text-[#2A1F1A]/40">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-[#2A1F1A]/40">· {s.floristEmail}</span>
                        </div>
                        <p className="font-body text-sm text-[#2A1F1A] leading-relaxed">{s.message}</p>
                        {s.adminNotes && (
                          <p className="text-xs text-[#7A8C6E] mt-1 italic">Notes: {s.adminNotes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {(["new", "reviewed", "actioned"] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => updateSuggestionStatus.mutate({ id: s.id, status })}
                            className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                              s.status === status
                                ? "bg-[#B5451B] text-white"
                                : "border border-[#2A1F1A]/10 text-[#2A1F1A]/40 hover:text-[#2A1F1A]"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "portfolio" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-xl">Portfolio / Lookbook</h2>
              <button onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {showPortfolioForm && (
              <div className="bg-white rounded border border-[#B5451B]/10 p-5 mb-6">
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-base mb-4">New Portfolio Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Title *", key: "title", placeholder: "e.g. Summer Zinnia Mix" },
                    { label: "Variety *", key: "variety", placeholder: "e.g. Zinnia elegans" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">{f.label}</label>
                      <input className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                        value={(newPortfolio as any)[f.key]} onChange={e => setNewPortfolio(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Season</label>
                    <select className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newPortfolio.season} onChange={e => setNewPortfolio(p => ({ ...p, season: e.target.value }))}>
                      {["spring","summer","fall","winter","year-round"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Sort Order</label>
                    <input type="number" className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                      value={newPortfolio.sortOrder} onChange={e => setNewPortfolio(p => ({ ...p, sortOrder: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-body text-xs text-[#2A1F1A]/50 mb-1">Description</label>
                    <textarea rows={2} className="w-full border border-[#B5451B]/20 rounded px-3 py-2 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                      value={newPortfolio.description} onChange={e => setNewPortfolio(p => ({ ...p, description: e.target.value }))} placeholder="Optional caption for florists" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => {
                    if (!newPortfolio.title || !newPortfolio.variety) { toast.error("Title and variety are required."); return; }
                    createPortfolio.mutate({ title: newPortfolio.title, variety: newPortfolio.variety, season: newPortfolio.season as any, description: newPortfolio.description || undefined, sortOrder: parseInt(newPortfolio.sortOrder) || 0 });
                  }} disabled={createPortfolio.isPending}
                    className="flex items-center gap-2 bg-[#B5451B] hover:bg-[#9e3c17] text-white font-body text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60"
                  >
                    {createPortfolio.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Item
                  </button>
                  <button onClick={() => setShowPortfolioForm(false)} className="font-body text-sm text-[#2A1F1A]/40 hover:text-[#2A1F1A] px-4 py-2 transition-colors">Cancel</button>
                </div>
              </div>
            )}
            {portfolioQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#B5451B] animate-spin" /></div>
            ) : (portfolioQuery.data ?? []).length === 0 ? (
              <div className="bg-white rounded border border-[#B5451B]/10 px-5 py-10 text-center font-body text-sm text-[#2A1F1A]/40">No portfolio items yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(portfolioQuery.data ?? []).map((item) => (
                  <div key={item.id} className="bg-white rounded border border-[#B5451B]/10 overflow-hidden">
                    <div className="relative h-44 bg-[#F5F0E8] flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-[#2A1F1A]/20" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePortfolioPhotoUpload(item.id, f); e.target.value = ""; }} />
                        {uploadingPortfolioPhotoId === item.id ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                            <span className="text-white text-xs font-body">{item.imageUrl ? "Replace Photo" : "Upload Photo"}</span>
                          </div>
                        )}
                      </label>
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 text-stone-700 capitalize">{item.season}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      {editingPortfolioId === item.id ? (
                        <div className="space-y-2">
                          <input className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editPortfolioData.title} onChange={e => setEditPortfolioData(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
                          <input className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                            value={editPortfolioData.variety} onChange={e => setEditPortfolioData(p => ({ ...p, variety: e.target.value }))} placeholder="Variety" />
                          <div className="flex gap-2">
                            <select className="flex-1 border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              value={editPortfolioData.season} onChange={e => setEditPortfolioData(p => ({ ...p, season: e.target.value }))}>
                              {["spring","summer","fall","winter","year-round"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                            <input type="number" className="w-20 border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B]"
                              value={editPortfolioData.sortOrder} onChange={e => setEditPortfolioData(p => ({ ...p, sortOrder: e.target.value }))} placeholder="Order" />
                          </div>
                          <textarea rows={2} className="w-full border border-[#B5451B]/20 rounded px-2 py-1.5 font-body text-sm text-[#2A1F1A] focus:outline-none focus:border-[#B5451B] resize-none"
                            value={editPortfolioData.description} onChange={e => setEditPortfolioData(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => updatePortfolio.mutate({ id: item.id, title: editPortfolioData.title, variety: editPortfolioData.variety, season: editPortfolioData.season as any, description: editPortfolioData.description || undefined, sortOrder: parseInt(editPortfolioData.sortOrder) || 0 })}
                              disabled={updatePortfolio.isPending}
                              className="flex items-center gap-1 bg-[#7A8C6E] hover:bg-[#6a7a5e] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                            >
                              {updatePortfolio.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                            </button>
                            <button onClick={() => setEditingPortfolioId(null)} className="flex items-center gap-1 font-body text-xs px-3 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-heading text-[#2A1F1A] font-semibold text-sm leading-tight">{item.title}</h3>
                          <p className="text-xs text-rose-600 font-medium mt-0.5">{item.variety}</p>
                          {item.description && <p className="text-xs text-[#2A1F1A]/50 mt-1.5 line-clamp-2">{item.description}</p>}
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => { setEditingPortfolioId(item.id); setEditPortfolioData({ title: item.title, variety: item.variety, season: item.season, description: item.description ?? "", sortOrder: String(item.sortOrder) }); }}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => showConfirm({ title: "Delete Portfolio Item", message: `Delete "${item.title}" from your portfolio permanently?`, confirmLabel: "Delete", danger: true, onConfirm: () => deletePortfolio.mutate({ id: item.id }) })}
                              disabled={deletePortfolio.isPending}
                              className="flex items-center gap-1 font-body text-xs px-2 py-1.5 rounded border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Confirmation Dialog Modal ──────────────────────────────────────────── */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-heading text-[#2A1F1A] font-bold text-lg mb-2">{confirmDialog.title}</h3>
            <p className="font-body text-[#2A1F1A]/60 text-sm mb-5">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={closeConfirm} className="font-body text-sm px-4 py-2 rounded border border-[#2A1F1A]/10 text-[#2A1F1A]/50 hover:text-[#2A1F1A] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }}
                className={`font-body text-sm font-semibold px-4 py-2 rounded transition-colors ${
                  confirmDialog.danger
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[#B5451B] hover:bg-[#9e3c17] text-white"
                }`}
              >
                {confirmDialog.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ───────────────────────────────────────────────────────── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A1F1A]/5">
              <div>
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-[#B5451B]">Preview</span>
                <h3 className="font-heading text-[#2A1F1A] font-bold text-lg">{previewItem.title}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-[#2A1F1A]/30 hover:text-[#2A1F1A] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Image */}
            {previewItem.imageUrl ? (
              <div className="w-full h-56 bg-[#F5F0E8] overflow-hidden">
                <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-40 bg-[#F5F0E8] flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-[#2A1F1A]/15" />
                <span className="font-body text-xs text-[#2A1F1A]/30 ml-2">No photo uploaded yet</span>
              </div>
            )}
            {/* Details */}
            <div className="px-5 py-4 space-y-2">
              {previewItem.description && (
                <p className="font-body text-sm text-[#2A1F1A]/70 leading-relaxed">{previewItem.description}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {previewItem.price && (
                  <span className="font-body text-sm font-semibold text-[#B5451B]">${previewItem.price}/bunch</span>
                )}
                {previewItem.quantity && (
                  <span className="font-body text-xs text-[#2A1F1A]/50">{previewItem.quantity} available</span>
                )}
                {previewItem.season && (
                  <span className="font-body text-xs text-[#2A1F1A]/40 capitalize">{previewItem.season}</span>
                )}
                {previewItem.category && (
                  <span className="font-body text-xs px-2 py-0.5 rounded-full bg-[#7A8C6E]/10 text-[#7A8C6E]">{previewItem.category}</span>
                )}
              </div>
              {previewItem.tags && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {previewItem.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="font-body text-xs px-2 py-0.5 rounded-full bg-[#B5451B]/8 text-[#B5451B]/70">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 pb-4">
              <button onClick={() => setPreviewItem(null)} className="w-full font-body text-sm text-[#2A1F1A]/40 hover:text-[#2A1F1A] transition-colors py-2">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
