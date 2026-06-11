/**
 * Red Dirt Blooms — Gallery
 * Three views: Photos (grid with lightbox), Varieties (dedicated variety cards), Placeholders (coming soon)
 * Features: DB-backed photos via trpc.gallery.getPublished, category filters, share button,
 *           interactive variety detail panel, full-screen lightbox with keyboard nav.
 */
import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  X, ChevronLeft, ChevronRight, Camera, Flower2, Clock, Leaf,
  ExternalLink, Share2, Check, LayoutGrid, BookOpen, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// ── Static placeholder images (shown when no DB photos exist for a category) ──
const STATIC_IMAGES = [
  {
    id: -1, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-field-wide-27bkUzzoMy2MuuarquMj8s.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-field-wide-NUzxuPoJ9iYrdhTudKgPMe.png",
    title: "The Field at Golden Hour", caption: "Rows of zinnias, sunflowers, and Indian Blanket wildflowers stretching across red Oklahoma clay.",
    category: "The Farm", span: "col-span-2 row-span-2", variety: undefined, varietyDetails: undefined,
  },
  {
    id: -2, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-sunflower-field-SgvBAPd8WNgDhb3cS8wwfN.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-sunflower-field-33wbzmhtkdMwshJFpSsmTX.png",
    title: "Prairie Chic", caption: "Walking the sunflower rows at golden hour.",
    category: "Sunflowers", span: "col-span-1 row-span-2",
    variety: "Sunflower — Autumn Beauty",
    varietyDetails: { latin: "Helianthus annuus 'Autumn Beauty'", vaseLife: "7–10 days", stemLength: "24–36 in", season: "Summer through fall", designUse: "Focal bloom, mixed bouquets, market bunches, fall arrangements", tags: ["Focal", "Multicolor", "Fall"], color: "#E8A020" },
  },
  {
    id: -3, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-zinnia-row-ZghCW29mWpsd4wRVNGmbMG.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-zinnia-row-hn2bkXiFCdFdfhDcwYpjQj.png",
    title: "Zinnia Row", caption: "Hot pink, orange, yellow, and red zinnias in full bloom in Oklahoma red clay.",
    category: "Zinnias", span: "col-span-1 row-span-1",
    variety: "Zinnia — Giant Pink",
    varietyDetails: { latin: "Zinnia elegans 'Giant Pink'", vaseLife: "7–12 days", stemLength: "24–30 in", season: "Summer through fall", designUse: "Focal bloom, mixed bouquets, wedding work, market bunches", tags: ["Focal", "Bold Color"], color: "#D4688A" },
  },
  {
    id: -4, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-dahlia-closeup-VXbsdbVnRHwXnH8hZ7vAMu.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-dahlia-closeup-eH6MXrBfuphrvfgLjGzKFN.png",
    title: "Dinner Plate Dahlia", caption: "A single perfect coral-orange dahlia with morning dew. This is why we grow.",
    category: "Dahlias", span: "col-span-1 row-span-1",
    variety: "Dahlia — Café au Lait",
    varietyDetails: { latin: "Dahlia 'Café au Lait'", vaseLife: "5–7 days", stemLength: "18–24 in", season: "Summer through fall", designUse: "Focal bloom, luxury bouquets, wedding work, editorial arrangements", tags: ["Focal", "Luxury", "Wedding"], color: "#C4682A" },
  },
  {
    id: -5, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-bouquet-table-Nhhwmjh5hjqQXotJbPGZgw.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-bouquet-table-RESQ3MDc99XSQJEkktT68A.png",
    title: "Oklahoma Kitchen", caption: "A mason jar full of zinnias, sunflowers, and amaranth on a farmhouse table.",
    category: "Arrangements", span: "col-span-1 row-span-1", variety: undefined, varietyDetails: undefined,
  },
  {
    id: -6, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-sunrise-farm-7VZ2ByJANjujpnKW4MFGPr.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-sunrise-farm-idX6MYUPR5Rgrcgo3PMoGF.png",
    title: "Oklahoma Sunrise", caption: "Mist rising over Indian Blanket flowers and sunflowers at dawn.",
    category: "The Farm", span: "col-span-2 row-span-1", variety: undefined, varietyDetails: undefined,
  },
  {
    id: -7, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-csa-box-JdfmSaVUKCdjyf2T9zxPUU.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-csa-box-ZAT8ZUoejsmHFERCnyjEdg.png",
    title: "The Bloom Box", caption: "A CSA share overflowing with dahlias, zinnias, celosia, and sunflowers.",
    category: "The Farm", span: "col-span-1 row-span-1", variety: undefined, varietyDetails: undefined,
  },
  {
    id: -8, src: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-harvest-hands-C7sFfVxCAzviNEeNSDKgGb.webp",
    full: "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/gallery-harvest-hands-bAvhHbgzM4bteq2j2TdnDT.png",
    title: "Straight From the Dirt", caption: "Every bouquet is hand-cut at peak bloom, red Oklahoma clay and all.",
    category: "The Farm", span: "col-span-1 row-span-1", variety: undefined, varietyDetails: undefined,
  },
];

// Varieties that will be grown this season — shown as placeholder cards in Varieties view
const VARIETY_PLACEHOLDERS = [
  { name: "Zinnia — Benary Giant Mix", latin: "Zinnia elegans", season: "Summer–Fall", vaseLife: "7–12 days", stemLength: "24–30 in", designUse: "Focal, mixed bouquets, market bunches", tags: ["Focal", "Bold Color"], color: "#E8A020", category: "Zinnias" },
  { name: "Zinnia — Queeny Lime Orange", latin: "Zinnia elegans", season: "Summer–Fall", vaseLife: "7–12 days", stemLength: "20–26 in", designUse: "Focal, wedding work, editorial", tags: ["Focal", "Trendy"], color: "#C4682A", category: "Zinnias" },
  { name: "Zinnia — Oklahoma Mix", latin: "Zinnia elegans", season: "Summer–Fall", vaseLife: "7–12 days", stemLength: "24–30 in", designUse: "Mixed bouquets, market bunches", tags: ["Mixed", "Bold Color"], color: "#D4688A", category: "Zinnias" },
  { name: "Dahlia — Café au Lait", latin: "Dahlia pinnata", season: "Summer–Fall", vaseLife: "5–7 days", stemLength: "18–24 in", designUse: "Focal, luxury bouquets, wedding", tags: ["Focal", "Luxury", "Wedding"], color: "#C4682A", category: "Dahlias" },
  { name: "Dahlia — Karma Choc", latin: "Dahlia pinnata", season: "Summer–Fall", vaseLife: "5–7 days", stemLength: "18–24 in", designUse: "Focal, luxury bouquets, editorial", tags: ["Focal", "Dark", "Wedding"], color: "#6B2D2D", category: "Dahlias" },
  { name: "Sunflower — Autumn Beauty", latin: "Helianthus annuus", season: "Summer–Fall", vaseLife: "7–10 days", stemLength: "24–36 in", designUse: "Focal, mixed bouquets, market bunches", tags: ["Focal", "Multicolor", "Fall"], color: "#E8A020", category: "Sunflowers" },
  { name: "Sunflower — Lemon Queen", latin: "Helianthus annuus", season: "Summer–Fall", vaseLife: "7–10 days", stemLength: "24–36 in", designUse: "Focal, mixed bouquets", tags: ["Focal", "Light"], color: "#F5E642", category: "Sunflowers" },
  { name: "Gomphrena — Audray Pink", latin: "Gomphrena haageana", season: "Summer–Fall", vaseLife: "14–21 days", stemLength: "18–24 in", designUse: "Filler, dried, accent", tags: ["Filler", "Dried", "Long-lasting"], color: "#D4688A", category: "Gomphrena" },
  { name: "Gomphrena — Audray Purple", latin: "Gomphrena haageana", season: "Summer–Fall", vaseLife: "14–21 days", stemLength: "18–24 in", designUse: "Filler, dried, accent", tags: ["Filler", "Dried", "Long-lasting"], color: "#7B5EA7", category: "Gomphrena" },
  { name: "Gomphrena — Audray Purple-Red", latin: "Gomphrena haageana", season: "Summer–Fall", vaseLife: "14–21 days", stemLength: "18–24 in", designUse: "Filler, dried, accent", tags: ["Filler", "Dried"], color: "#8B2252", category: "Gomphrena" },
  { name: "Gomphrena — Audray White", latin: "Gomphrena haageana", season: "Summer–Fall", vaseLife: "14–21 days", stemLength: "18–24 in", designUse: "Filler, dried, accent", tags: ["Filler", "Dried", "Neutral"], color: "#9B8EA0", category: "Gomphrena" },
  { name: "Marigold — Orange Lei", latin: "Tagetes erecta", season: "Summer–Fall", vaseLife: "7–10 days", stemLength: "18–24 in", designUse: "Filler, accent, cultural events", tags: ["Filler", "Fragrant"], color: "#E8A020", category: "Marigolds" },
  { name: "Marigold — Red Metamorphosis", latin: "Tagetes erecta", season: "Summer–Fall", vaseLife: "7–10 days", stemLength: "18–24 in", designUse: "Filler, accent, bold arrangements", tags: ["Filler", "Bold Color"], color: "#B5451B", category: "Marigolds" },
  { name: "Marigold — Sparkler", latin: "Tagetes erecta", season: "Summer–Fall", vaseLife: "7–10 days", stemLength: "18–24 in", designUse: "Filler, accent, mixed bouquets", tags: ["Filler", "Bicolor"], color: "#C4682A", category: "Marigolds" },
  { name: "Celosia — Coral Garden", latin: "Celosia argentea", season: "Summer–Fall", vaseLife: "10–14 days", stemLength: "18–24 in", designUse: "Filler, texture, dried", tags: ["Filler", "Texture", "Dried"], color: "#D4688A", category: "Celosia" },
];

const PHOTO_CATEGORIES = ["All", "The Farm", "Zinnias", "Dahlias", "Sunflowers", "Gomphrena", "Marigolds", "Celosia", "Arrangements", "Other"];
const VARIETY_CATEGORIES = ["All", "Zinnias", "Dahlias", "Sunflowers", "Gomphrena", "Marigolds", "Celosia"];

type ViewMode = "photos" | "varieties" | "coming-soon";

interface GalleryImg {
  id: number;
  src: string;
  full: string;
  title: string;
  caption: string;
  category: string;
  span: string;
  variety?: string;
  varietyDetails?: {
    latin: string; vaseLife: string; stemLength: string;
    season: string; designUse: string; tags: string[]; color: string;
  };
}

function dbPhotoToImg(p: any): GalleryImg {
  return {
    id: p.id,
    src: p.imageUrl ?? "",
    full: p.imageUrl ?? "",
    title: p.title,
    caption: p.caption ?? "",
    category: p.category,
    span: "col-span-1 row-span-1",
    variety: p.variety ?? undefined,
    varietyDetails: p.variety ? {
      latin: p.varietyLatin ?? "",
      vaseLife: p.varietyVaseLife ?? "",
      stemLength: p.varietyStemLength ?? "",
      season: p.varietySeason ?? "",
      designUse: p.varietyDesignUse ?? "",
      tags: p.varietyTags ? p.varietyTags.split(",").map((t: string) => t.trim()) : [],
      color: p.varietyColor ?? "#B5451B",
    } : undefined,
  };
}

export default function Gallery() {
  const [viewMode, setViewMode] = useState<ViewMode>("photos");
  const [activeCategory, setActiveCategory] = useState("All");
  const [varietyCategory, setVarietyCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImg | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const galleryQuery = trpc.gallery.getPublished.useQuery();
  const dbPhotos: GalleryImg[] = useMemo(
    () => (galleryQuery.data ?? []).filter(p => p.imageUrl).map(dbPhotoToImg),
    [galleryQuery.data]
  );

  // Merge DB photos + static fallbacks (static only shown if no DB photos at all)
  const allPhotos: GalleryImg[] = dbPhotos.length > 0 ? dbPhotos : STATIC_IMAGES as GalleryImg[];

  const filteredPhotos = useMemo(
    () => activeCategory === "All" ? allPhotos : allPhotos.filter(img => img.category === activeCategory),
    [activeCategory, allPhotos]
  );

  const filteredVarieties = useMemo(
    () => varietyCategory === "All" ? VARIETY_PLACEHOLDERS : VARIETY_PLACEHOLDERS.filter(v => v.category === varietyCategory),
    [varietyCategory]
  );

  const openLightbox = (index: number) => { setLightboxIndex(index); setSelectedImage(null); };
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + filteredPhotos.length) % filteredPhotos.length : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % filteredPhotos.length : null);
  const currentImage = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleCardClick = (img: GalleryImg) => {
    if (img.variety) {
      if (selectedImage?.id === img.id) {
        openLightbox(filteredPhotos.findIndex(f => f.id === img.id));
      } else {
        setSelectedImage(img);
      }
    } else {
      openLightbox(filteredPhotos.findIndex(f => f.id === img.id));
    }
  };

  async function handleShare(img: GalleryImg) {
    const shareUrl = `${window.location.origin}/gallery`;
    const shareText = img.variety
      ? `${img.variety} — grown at Red Dirt Blooms in Oklahoma. ${img.caption}`
      : `${img.title} — ${img.caption}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: img.title, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedId(img.id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Hero */}
      <section className="bg-[#2A1F1A] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">From the Field</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-3" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            The Gallery
          </h1>
          <p className="font-body text-[#F5F0E8]/60 text-base max-w-xl mx-auto">
            A visual record of the farm — the flowers, the harvest, and the red Oklahoma dirt that makes it all possible.
          </p>
        </div>
      </section>

      {/* View Mode Switcher */}
      <div className="sticky top-16 lg:top-20 z-30 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#B5451B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {/* View mode tabs */}
            <div className="flex gap-1 mr-4 flex-shrink-0">
              {([
                { key: "photos" as ViewMode, label: "Photos", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
                { key: "varieties" as ViewMode, label: "Varieties", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { key: "coming-soon" as ViewMode, label: "Coming Soon", icon: <Sparkles className="w-3.5 h-3.5" /> },
              ] as const).map(v => (
                <button key={v.key} onClick={() => { setViewMode(v.key); setSelectedImage(null); }}
                  className={`flex items-center gap-1.5 font-body text-sm font-semibold px-3 py-2 rounded transition-colors ${
                    viewMode === v.key ? "bg-[#2A1F1A] text-[#F5F0E8]" : "text-[#2A1F1A]/60 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>

            {/* Category filter — only show for photos and varieties */}
            {viewMode === "photos" && (
              <>
                <div className="w-px h-6 bg-[#B5451B]/20 flex-shrink-0" />
                <div className="flex gap-1 overflow-x-auto">
                  {PHOTO_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setSelectedImage(null); }}
                      className={`flex-shrink-0 font-body text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                        activeCategory === cat ? "bg-[#B5451B] text-[#F5F0E8]" : "text-[#2A1F1A]/60 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                      }`}
                    >{cat}</button>
                  ))}
                </div>
                <span className="ml-auto font-body text-xs text-[#2A1F1A]/40 self-center flex-shrink-0 pr-1">
                  {filteredPhotos.length} photos
                </span>
              </>
            )}

            {viewMode === "varieties" && (
              <>
                <div className="w-px h-6 bg-[#B5451B]/20 flex-shrink-0" />
                <div className="flex gap-1 overflow-x-auto">
                  {VARIETY_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setVarietyCategory(cat)}
                      className={`flex-shrink-0 font-body text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                        varietyCategory === cat ? "bg-[#B5451B] text-[#F5F0E8]" : "text-[#2A1F1A]/60 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                      }`}
                    >{cat}</button>
                  ))}
                </div>
                <span className="ml-auto font-body text-xs text-[#2A1F1A]/40 self-center flex-shrink-0 pr-1">
                  {filteredVarieties.length} varieties
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── PHOTOS VIEW ──────────────────────────────────────────────────── */}
      {viewMode === "photos" && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex gap-6 ${selectedImage ? "flex-col lg:flex-row" : ""}`}>
              {/* Photo Grid */}
              <div className={`${selectedImage ? "lg:flex-1" : "w-full"}`}>
                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-20">
                    <Camera className="w-10 h-10 text-[#B5451B]/30 mx-auto mb-3" />
                    <p className="font-heading text-[#2A1F1A]/40 text-lg">No photos in this category yet.</p>
                    <p className="font-body text-sm text-[#2A1F1A]/30 mt-2">Check back soon — more photos are on the way.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
                    {filteredPhotos.map((img, index) => (
                      <div
                        key={img.id}
                        className={`relative overflow-hidden rounded cursor-pointer group ${img.span} ${selectedImage?.id === img.id ? "ring-2 ring-[#B5451B]" : ""}`}
                        onClick={() => handleCardClick(img)}
                      >
                        {img.src ? (
                          <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-[#2A1F1A]/10 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-[#2A1F1A]/20" />
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1F1A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Variety badge */}
                        {img.variety && (
                          <div className="absolute top-2 right-2 font-body text-[10px] font-semibold px-2 py-0.5 rounded text-white flex items-center gap-1"
                            style={{ background: img.varietyDetails?.color ?? "#B5451B" }}>
                            <Flower2 className="w-2.5 h-2.5" /> Variety
                          </div>
                        )}
                        {/* Category badge */}
                        <div className="absolute top-2 left-2 font-body text-[10px] font-semibold px-2 py-0.5 rounded bg-[#2A1F1A]/70 text-[#F5F0E8]">
                          {img.category}
                        </div>
                        {/* Caption on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="font-heading text-[#F5F0E8] font-semibold text-sm leading-tight">{img.title}</p>
                          <p className="font-body text-[#F5F0E8]/70 text-xs mt-0.5 line-clamp-2">{img.caption}</p>
                          {img.variety ? (
                            <p className="font-body text-[#E8A020] text-[10px] mt-1">Click for variety details · double-click for full view</p>
                          ) : (
                            <p className="font-body text-[#F5F0E8]/50 text-[10px] mt-1">Click to view full size</p>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); handleShare(img); }}
                            className="w-7 h-7 rounded bg-[#2A1F1A]/60 flex items-center justify-center hover:bg-[#7A8C6E] transition-colors"
                            aria-label="Share"
                          >
                            {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <button onClick={e => { e.stopPropagation(); openLightbox(index); }}
                            className="w-7 h-7 rounded bg-[#2A1F1A]/60 flex items-center justify-center hover:bg-[#B5451B] transition-colors"
                            aria-label="View full size"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Placeholder slots — shown when fewer than 8 photos */}
                    {filteredPhotos.length < 8 && Array.from({ length: Math.min(4, 8 - filteredPhotos.length) }).map((_, i) => (
                      <div key={`placeholder-${i}`} className="relative overflow-hidden rounded bg-[#2A1F1A]/5 border-2 border-dashed border-[#B5451B]/20 flex flex-col items-center justify-center gap-2">
                        <Camera className="w-6 h-6 text-[#B5451B]/30" />
                        <span className="font-body text-xs text-[#2A1F1A]/30 text-center px-3">More photos coming soon</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variety Detail Panel */}
              {selectedImage && selectedImage.varietyDetails && (
                <div className="lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded border border-[#B5451B]/10 overflow-hidden sticky top-32">
                    <div className="relative">
                      <img src={selectedImage.src} alt={selectedImage.title} className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A1F1A]/80 to-transparent" />
                      <button onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#2A1F1A]/60 flex items-center justify-center hover:bg-[#B5451B] transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <p className="font-heading text-[#F5F0E8] font-bold text-base leading-tight">{selectedImage.variety}</p>
                        <p className="font-body text-[#F5F0E8]/60 text-xs italic">{selectedImage.varietyDetails.latin}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.varietyDetails.tags.map(tag => (
                          <span key={tag} className="font-body text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ background: selectedImage.varietyDetails!.color }}>{tag}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Vase Life</p>
                          <p className="font-body text-sm font-semibold text-[#2A1F1A]/80">{selectedImage.varietyDetails.vaseLife}</p>
                        </div>
                        <div>
                          <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Stem Length</p>
                          <p className="font-body text-sm font-semibold text-[#2A1F1A]/80">{selectedImage.varietyDetails.stemLength}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30 mb-1"><Clock className="w-3 h-3 inline mr-1" />Season</p>
                        <p className="font-body text-xs text-[#2A1F1A]/70">{selectedImage.varietyDetails.season}</p>
                      </div>
                      <div>
                        <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30 mb-1"><Leaf className="w-3 h-3 inline mr-1" />Design Use</p>
                        <p className="font-body text-xs text-[#2A1F1A]/70 leading-relaxed">{selectedImage.varietyDetails.designUse}</p>
                      </div>
                      <div className="border-t border-[#B5451B]/10 pt-3">
                        <p className="font-heading text-[#2A1F1A] font-semibold text-sm mb-1">{selectedImage.title}</p>
                        <p className="font-body text-xs text-[#2A1F1A]/60 leading-relaxed">{selectedImage.caption}</p>
                      </div>
                      <div className="flex flex-col gap-2 pt-1">
                        <button onClick={() => handleShare(selectedImage)}
                          className="w-full flex items-center justify-center gap-2 bg-[#7A8C6E]/10 hover:bg-[#7A8C6E]/20 text-[#7A8C6E] font-body text-xs font-semibold py-2 rounded transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share This Photo
                        </button>
                        <button onClick={() => openLightbox(filteredPhotos.findIndex(f => f.id === selectedImage.id))}
                          className="w-full bg-[#2A1F1A]/5 hover:bg-[#2A1F1A]/10 text-[#2A1F1A] font-body text-xs font-semibold py-2 rounded transition-colors"
                        >
                          View Full Size
                        </button>
                        <Link href="/whats-in-the-ground">
                          <span className="block w-full text-center bg-[#B5451B] hover:bg-[#9e3c17] text-[#F5F0E8] font-body text-xs font-semibold py-2 rounded transition-colors cursor-pointer">
                            See All Growing Varieties →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── VARIETIES VIEW ───────────────────────────────────────────────── */}
      {viewMode === "varieties" && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-2xl">Season 1 Varieties</h2>
              <p className="font-body text-sm text-[#2A1F1A]/50 mt-1">Every variety grown from seed at Red Dirt Blooms. Click any card to explore details.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVarieties.map((v, i) => (
                <div key={i} className="bg-white rounded border border-[#B5451B]/10 overflow-hidden group hover:shadow-md transition-shadow">
                  {/* Color header */}
                  <div className="h-3 w-full" style={{ background: v.color }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-heading text-[#2A1F1A] font-semibold text-sm leading-tight">{v.name}</h3>
                        <p className="font-body text-xs text-[#2A1F1A]/40 italic mt-0.5">{v.latin}</p>
                      </div>
                      <span className="font-body text-[10px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0 ml-2"
                        style={{ background: v.color }}>{v.category}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Vase Life</p>
                        <p className="font-body text-xs font-semibold text-[#2A1F1A]/80">{v.vaseLife}</p>
                      </div>
                      <div>
                        <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Stem Length</p>
                        <p className="font-body text-xs font-semibold text-[#2A1F1A]/80">{v.stemLength}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30 mb-1">Design Use</p>
                      <p className="font-body text-xs text-[#2A1F1A]/60 leading-relaxed">{v.designUse}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {v.tags.map(tag => (
                        <span key={tag} className="font-body text-[10px] px-2 py-0.5 rounded-full text-white"
                          style={{ background: v.color + "cc" }}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#B5451B]/10">
                      <button onClick={() => {
                        const text = `${v.name} (${v.latin}) — ${v.designUse}. Vase life: ${v.vaseLife}. Grown at Red Dirt Blooms, Oklahoma.`;
                        navigator.clipboard.writeText(text).then(() => toast.success("Variety details copied!"));
                      }}
                        className="w-full flex items-center justify-center gap-1.5 font-body text-xs text-[#2A1F1A]/50 hover:text-[#B5451B] transition-colors py-1"
                      >
                        <Share2 className="w-3 h-3" /> Share Variety
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMING SOON VIEW ─────────────────────────────────────────────── */}
      {viewMode === "coming-soon" && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="font-heading text-[#2A1F1A] font-bold text-2xl">Coming to the Gallery</h2>
              <p className="font-body text-sm text-[#2A1F1A]/50 mt-1">These photo slots are reserved for real farm photos as they're captured this season.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
              {[
                { label: "Zinnia Field", sub: "Full rows at peak bloom" },
                { label: "Dahlia Close-ups", sub: "Café au Lait & Karma Choc" },
                { label: "Harvest Day", sub: "Cutting and bunching" },
                { label: "Gomphrena Rows", sub: "Audray series in bloom" },
                { label: "Marigold Beds", sub: "Orange Lei & Red Metamorphosis" },
                { label: "Celosia Plumes", sub: "Coral Garden in full color" },
                { label: "Bloom Box", sub: "Season 1 CSA shares" },
                { label: "Sunflower Rows", sub: "Autumn Beauty & Lemon Queen" },
                { label: "Seed Starting", sub: "Behind the scenes" },
                { label: "First Bouquets", sub: "Season 1 arrangements" },
                { label: "The Farm", sub: "Red dirt, blue sky" },
                { label: "Market Day", sub: "Flowers ready to go" },
              ].map((slot, i) => (
                <div key={i} className="relative overflow-hidden rounded bg-[#2A1F1A]/5 border-2 border-dashed border-[#B5451B]/20 flex flex-col items-center justify-center gap-2 p-3">
                  <Camera className="w-7 h-7 text-[#B5451B]/30" />
                  <div className="text-center">
                    <p className="font-heading text-[#2A1F1A]/50 text-sm font-semibold">{slot.label}</p>
                    <p className="font-body text-xs text-[#2A1F1A]/30">{slot.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-[#2A1F1A] rounded p-6 text-center">
              <Sparkles className="w-8 h-8 text-[#E8A020] mx-auto mb-3" />
              <h3 className="font-heading text-[#F5F0E8] font-bold text-xl mb-2">Season 1 is Underway</h3>
              <p className="font-body text-[#F5F0E8]/60 text-sm max-w-md mx-auto mb-4">
                Real photos from the farm will fill these slots as the season progresses. Sign up for Bloom Watch to get notified when new photos drop.
              </p>
              <Link href="/#bloom-watch">
                <span className="inline-block bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer text-sm">
                  Join Bloom Watch
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-[#2A1F1A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Flower2 className="w-8 h-8 text-[#E8A020] mx-auto mb-4" />
          <h2 className="font-heading text-[#F5F0E8] font-bold text-3xl mb-3">Want These in Your Home?</h2>
          <p className="font-body text-[#F5F0E8]/60 mb-6 max-w-xl mx-auto">
            Shop fresh-cut bouquets, subscribe to a Bloom Box, or explore what's growing now.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/harvest-stand">
              <span className="inline-block bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold px-6 py-3 rounded transition-colors cursor-pointer">
                Shop the Harvest
              </span>
            </Link>
            <Link href="/whats-in-the-ground">
              <span className="inline-block bg-transparent border border-[#F5F0E8]/30 hover:border-[#F5F0E8]/60 text-[#F5F0E8] font-body font-semibold px-6 py-3 rounded transition-colors cursor-pointer">
                What's in the Ground
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0f0a]/95 backdrop-blur-sm">
          <button onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <button onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[85vh] mx-16 flex flex-col items-center">
            {currentImage.src ? (
              <img src={currentImage.full || currentImage.src} alt={currentImage.title}
                className="max-h-[75vh] max-w-full object-contain rounded" />
            ) : (
              <div className="w-96 h-64 bg-[#2A1F1A]/30 rounded flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/30" />
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="font-heading text-white font-semibold text-lg">{currentImage.title}</p>
              <p className="font-body text-white/60 text-sm mt-1 max-w-lg">{currentImage.caption}</p>
              {currentImage.variety && (
                <p className="font-body text-[#E8A020] text-xs mt-1 flex items-center justify-center gap-1">
                  <Flower2 className="w-3 h-3" /> {currentImage.variety}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 mt-2">
                <p className="font-body text-white/30 text-xs">{lightboxIndex + 1} / {filteredPhotos.length}</p>
                <button onClick={() => handleShare(currentImage)}
                  className="flex items-center gap-1.5 font-body text-xs text-white/50 hover:text-white transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          </div>
          <button onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
