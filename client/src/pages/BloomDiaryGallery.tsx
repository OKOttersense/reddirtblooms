/**
 * Red Dirt Blooms — Bloom Diary Gallery
 * Bold, vibrant, award-winning flower showcase
 * Standardized imagery with epic UX and strategic rule-breaking design
 */

import { useState, useRef } from "react";
import { ChevronRight, ChevronLeft, Heart, Share2, Info } from "lucide-react";
import { toast } from "sonner";

interface FlowerImage {
  id: string;
  variety: string;
  type: "filler" | "focal" | "foliage";
  color: string;
  storage_path: string;
  description: string;
  date: string;
  stage?: string;
}

const FLOWER_GALLERY: FlowerImage[] = [
  {
    id: "yarrow_01",
    variety: "Yarrow",
    type: "filler",
    color: "Purple/Pink",
    storage_path: "/manus-storage/IMG_0352_std_9dea187b.jpg",
    description: "Yarrow cluster showing dense, vibrant purple-pink flower heads",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "yarrow_02",
    variety: "Yarrow",
    type: "filler",
    color: "Purple/Pink",
    storage_path: "/manus-storage/IMG_0363_std_eb3885be.jpg",
    description: "Close-up of yarrow florets with natural garden background",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "zinnia_01",
    variety: "Zinnia",
    type: "focal",
    color: "Yellow",
    storage_path: "/manus-storage/IMG_0369_std_ddb64d70.jpg",
    description: "Bright yellow zinnia with prominent stamens and buds",
    date: "May 31, 2026",
    stage: "Blooming",
  },
  {
    id: "zinnia_02",
    variety: "Zinnia",
    type: "focal",
    color: "Red",
    storage_path: "/manus-storage/IMG_0376_std_419448c1.jpg",
    description: "Vibrant red zinnia with full bloom and emerging buds",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "dahlia_01",
    variety: "Dahlia",
    type: "focal",
    color: "Pink/Magenta",
    storage_path: "/manus-storage/image000000_1_std_35ce3606.jpg",
    description: "Single dahlia bloom with delicate pink petals",
    date: "May 31, 2026",
    stage: "Blooming",
  },
  {
    id: "dahlia_02",
    variety: "Dahlia",
    type: "focal",
    color: "Pink/Magenta",
    storage_path: "/manus-storage/image000000_std_c9da4998.jpg",
    description: "Decorative dahlia arrangement with garden backdrop",
    date: "May 26, 2026",
    stage: "Arrangement",
  },
  {
    id: "phlox_01",
    variety: "Phlox",
    type: "filler",
    color: "Purple",
    storage_path: "/manus-storage/image000002_1_std_655423a0.jpg",
    description: "Phlox flower head with clustered blooms in vibrant purple",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "phlox_02",
    variety: "Phlox",
    type: "filler",
    color: "Purple",
    storage_path: "/manus-storage/image000002_std_ff5124df.jpg",
    description: "Multiple phlox clusters showing color progression",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "echinacea_01",
    variety: "Echinacea",
    type: "focal",
    color: "Pink/Purple",
    storage_path: "/manus-storage/image000004_1_std_71a89194.jpg",
    description: "Echinacea with distinctive cone center and pink petals",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
  {
    id: "gaura_01",
    variety: "Gaura",
    type: "filler",
    color: "Pink/White",
    storage_path: "/manus-storage/image000005_std_d9d83b8b.jpg",
    description: "Gaura flower detail showing delicate pink and white petals",
    date: "May 26, 2026",
    stage: "Blooming",
  },
  {
    id: "lamb_ear_01",
    variety: "Lamb's Ear",
    type: "foliage",
    color: "Purple/Silver",
    storage_path: "/manus-storage/image000009_std_7f62c863.jpg",
    description: "Lamb's Ear flower spike with purple blooms and silvery foliage",
    date: "May 26, 2026",
    stage: "Peak Bloom",
  },
];

const TYPE_COLORS = {
  filler: "from-pink-500 to-rose-600",
  focal: "from-orange-500 to-red-600",
  foliage: "from-emerald-500 to-teal-600",
};

const TYPE_LABELS = {
  filler: "Filler",
  focal: "Focal",
  foliage: "Foliage",
};

export default function BloomDiaryGallery() {
  const [selectedFlower, setSelectedFlower] = useState<FlowerImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
      toast.success("Added to favorites! 🌸");
    }
    setFavorites(newFavorites);
  };

  const handleShare = (flower: FlowerImage) => {
    const text = `Check out this ${flower.variety} from Red Dirt Blooms! ${flower.description}`;
    if (navigator.share) {
      navigator.share({ title: flower.variety, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-pink-100 to-rose-100 opacity-40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
              The Bloom Diary Gallery
            </h1>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              Standardized, vibrant, award-winning photography of Oklahoma's finest flowers. Every image tells a story.
            </p>
          </div>

          {/* Type Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(Object.entries(TYPE_COLORS) as Array<[keyof typeof TYPE_COLORS, string]>).map(([type, gradient]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient}`} />
                <span className="text-sm font-medium text-slate-700 capitalize">{TYPE_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Flower (Large) */}
      {selectedFlower && (
        <section className="px-4 md:px-8 mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={selectedFlower.storage_path}
                    alt={selectedFlower.variety}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold text-sm bg-gradient-to-r ${
                      TYPE_COLORS[selectedFlower.type]
                    }`}
                  >
                    {TYPE_LABELS[selectedFlower.type]}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">{selectedFlower.variety}</h2>
                    <p className="text-lg text-slate-600 mb-6">{selectedFlower.color}</p>
                    <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-xl mb-6 border-l-4 border-orange-500">
                      <p className="text-slate-800 leading-relaxed">{selectedFlower.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600 w-24">Stage:</span>
                        <span className="text-sm text-slate-700">{selectedFlower.stage || "Growing"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600 w-24">Captured:</span>
                        <span className="text-sm text-slate-700">{selectedFlower.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => toggleFavorite(selectedFlower.id)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        favorites.has(selectedFlower.id)
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Heart size={20} fill={favorites.has(selectedFlower.id) ? "currentColor" : "none"} />
                      {favorites.has(selectedFlower.id) ? "Favorited" : "Favorite"}
                    </button>
                    <button
                      onClick={() => handleShare(selectedFlower)}
                      className="flex-1 py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={20} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid - Horizontal Scroll */}
      <section className="px-4 md:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">All Varieties</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={24} className="text-slate-700" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronRight size={24} className="text-slate-700" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            {FLOWER_GALLERY.map((flower) => (
              <div
                key={flower.id}
                onClick={() => setSelectedFlower(flower)}
                className="flex-shrink-0 w-72 cursor-pointer group"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 mb-4 border-2 border-transparent hover:border-orange-500 transition-all">
                  <img
                    src={flower.storage_path}
                    alt={flower.variety}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Info size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${
                      TYPE_COLORS[flower.type]
                    }`}
                  >
                    {TYPE_LABELS[flower.type]}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{flower.variety}</h3>
                <p className="text-sm text-slate-600">{flower.color}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(flower.id);
                  }}
                  className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  {favorites.has(flower.id) ? "♥ Favorited" : "♡ Add to Favorites"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 mb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Bring These Blooms Home?</h2>
          <p className="text-lg mb-8 opacity-95">
            Visit the Harvest Stand to order fresh bunches of your favorite varieties.
          </p>
          <a
            href="/harvest-stand"
            className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Shop Now →
          </a>
        </div>
      </section>
    </div>
  );
}
