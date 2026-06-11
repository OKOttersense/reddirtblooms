/**
 * FloristPortfolio — Public lookbook page
 * No login required. Accessible via QR code on sample cards.
 * Shows past work photos organized by variety and season.
 * CTAs guide visitors to register or log in.
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, ChevronLeft, ChevronRight, Search, Flower2, LogIn, UserPlus, Heart } from "lucide-react";
import { toast } from "sonner";

const SEASON_COLORS: Record<string, string> = {
  spring: "bg-pink-100 text-pink-800 border-pink-200",
  summer: "bg-amber-100 text-amber-800 border-amber-200",
  fall: "bg-orange-100 text-orange-800 border-orange-200",
  winter: "bg-blue-100 text-blue-800 border-blue-200",
  "year-round": "bg-green-100 text-green-800 border-green-200",
};

const SEASONS = ["all", "spring", "summer", "fall", "winter", "year-round"] as const;

export default function FloristPortfolio() {
  const { data: items = [], isLoading } = trpc.portfolio.getAll.useQuery();
  const { data: favoriteIds = [] } = trpc.portfolio.getMyFavorites.useQuery();
  const utils = trpc.useUtils();
  const toggleFav = trpc.portfolio.toggleFavorite.useMutation({
    onSuccess: (data) => {
      utils.portfolio.getMyFavorites.invalidate();
      toast(data.favorited ? "Added to favorites ❤️" : "Removed from favorites");
    },
    onError: () => {
      toast.error("Log in to save favorites");
    },
  });

  const [search, setSearch] = useState("");
  const [season, setSeason] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSeason = season === "all" || item.season === season;
      const matchesSearch =
        !search ||
        item.variety.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesSeason && matchesSearch;
    });
  }, [items, search, season]);

  // Items with photos only (for lightbox navigation)
  const photoItems = useMemo(() => filtered.filter((i) => i.imageUrl), [filtered]);

  const openLightbox = (item: typeof items[0]) => {
    const idx = photoItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + photoItems.length) % photoItems.length);
  };

  const nextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % photoItems.length);
  };

  const currentPhoto = lightboxIndex !== null ? photoItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Flower2 className="w-7 h-7 text-rose-500" />
            <div>
              <h1 className="font-bold text-stone-900 text-lg leading-tight">Red Dirt Blooms</h1>
              <p className="text-xs text-stone-500">Wholesale Portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/florist-login">
              <Button variant="outline" size="sm" className="gap-1.5 text-stone-700">
                <LogIn className="w-3.5 h-3.5" />
                Log In
              </Button>
            </Link>
            <Link href="/florist-register">
              <Button size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-stone-100 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <p className="text-xs font-semibold tracking-widest text-rose-500 uppercase mb-2">Oklahoma Grown</p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3">
            Locally Grown, Seasonally Harvested
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto text-base mb-6">
            Browse our past harvests — specialty cut flowers grown right here in Oklahoma. 
            Create a wholesale account to order directly from the farm.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/florist-register">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white px-6">
                Apply for Wholesale Access
              </Button>
            </Link>
            <Link href="/florist-login">
              <Button variant="outline" className="px-6 text-stone-700">
                Already have an account? Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search variety or flower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-stone-200"
            />
          </div>
          {/* Season filter */}
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                  season === s
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white text-stone-600 border-stone-200 hover:border-rose-300"
                }`}
              >
                {s === "all" ? "All Seasons" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-stone-500 mt-3">
            {filtered.length === 0
              ? "No items match your filters."
              : `${filtered.length} ${filtered.length === 1 ? "variety" : "varieties"} shown`}
          </p>
        )}
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Flower2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No varieties found</p>
            <p className="text-sm mt-1">Try adjusting your search or season filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Photo */}
                <div
                  className={`relative overflow-hidden bg-stone-100 ${item.imageUrl ? "cursor-pointer" : ""}`}
                  style={{ aspectRatio: "4/3" }}
                  onClick={() => item.imageUrl && openLightbox(item)}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Flower2 className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                  {/* Season badge overlay */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                        SEASON_COLORS[item.season] ?? "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {item.season}
                    </span>
                  </div>
                  {/* Favorite button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav.mutate({ portfolioItemId: item.id });
                    }}
                    title={favoriteIds.includes(item.id) ? "Remove from favorites" : "Save to favorites"}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        favoriteIds.includes(item.id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-stone-400 hover:text-rose-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 text-base leading-tight">{item.title}</h3>
                  <p className="text-sm text-rose-600 font-medium mt-0.5">{item.variety}</p>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {!isLoading && items.length > 0 && (
        <div className="bg-rose-600 text-white py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to order from the farm?</h3>
            <p className="text-rose-100 mb-6">
              Create a free wholesale account and get access to our weekly harvest board, 
              pricing, and direct ordering.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/florist-register">
                <Button className="bg-white text-rose-700 hover:bg-rose-50 px-6 font-semibold">
                  Apply for Wholesale Access
                </Button>
              </Link>
              <Link href="/florist-login">
                <Button variant="outline" className="border-white text-white hover:bg-rose-700 px-6">
                  Log In to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={closeLightbox}
          >
            <X className="w-7 h-7" />
          </button>

          {photoItems.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.imageUrl!}
              alt={currentPhoto.title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg">{currentPhoto.title}</p>
              <p className="text-rose-300 text-sm font-medium">{currentPhoto.variety}</p>
              {currentPhoto.description && (
                <p className="text-white/70 text-sm mt-1">{currentPhoto.description}</p>
              )}
              <p className="text-white/40 text-xs mt-2 capitalize">{currentPhoto.season}</p>
              {photoItems.length > 1 && (
                <p className="text-white/40 text-xs mt-1">
                  {(lightboxIndex ?? 0) + 1} of {photoItems.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
