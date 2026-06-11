/**
 * Red Dirt Blooms — Master Gallery
 * Epic, award-winning showcase of all standardized flower photography
 * Bold, vibrant design with strategic rule-breaking UX
 */

import { useState } from "react";
import { Grid3x3, List, Heart, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryFlower {
  id: string;
  variety: string;
  type: "filler" | "focal" | "foliage";
  color: string;
  storage_path: string;
  description: string;
  date: string;
  section: string[];
}

const ALL_FLOWERS: GalleryFlower[] = [
  {
    id: "yarrow_01",
    variety: "Yarrow",
    type: "filler",
    color: "Purple/Pink",
    storage_path: "/manus-storage/IMG_0352_std_9dea187b.jpg",
    description: "Yarrow cluster showing dense, vibrant purple-pink flower heads",
    date: "May 26, 2026",
    section: ["in_the_ground", "gallery"],
  },
  {
    id: "yarrow_02",
    variety: "Yarrow",
    type: "filler",
    color: "Purple/Pink",
    storage_path: "/manus-storage/IMG_0363_std_eb3885be.jpg",
    description: "Close-up of yarrow florets with natural garden background",
    date: "May 26, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "zinnia_01",
    variety: "Zinnia",
    type: "focal",
    color: "Yellow",
    storage_path: "/manus-storage/IMG_0369_std_ddb64d70.jpg",
    description: "Bright yellow zinnia with prominent stamens and buds",
    date: "May 31, 2026",
    section: ["bloom_diary", "gallery"],
  },
  {
    id: "zinnia_02",
    variety: "Zinnia",
    type: "focal",
    color: "Red",
    storage_path: "/manus-storage/IMG_0376_std_419448c1.jpg",
    description: "Vibrant red zinnia with full bloom and emerging buds",
    date: "May 26, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "dahlia_01",
    variety: "Dahlia",
    type: "focal",
    color: "Pink/Magenta",
    storage_path: "/manus-storage/image000000_1_std_35ce3606.jpg",
    description: "Single dahlia bloom with delicate pink petals",
    date: "May 31, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "dahlia_02",
    variety: "Dahlia",
    type: "focal",
    color: "Pink/Magenta",
    storage_path: "/manus-storage/image000000_std_c9da4998.jpg",
    description: "Decorative dahlia arrangement with garden backdrop",
    date: "May 26, 2026",
    section: ["bloom_diary", "gallery"],
  },
  {
    id: "phlox_01",
    variety: "Phlox",
    type: "filler",
    color: "Purple",
    storage_path: "/manus-storage/image000002_1_std_655423a0.jpg",
    description: "Phlox flower head with clustered blooms in vibrant purple",
    date: "May 26, 2026",
    section: ["in_the_ground"],
  },
  {
    id: "phlox_02",
    variety: "Phlox",
    type: "filler",
    color: "Purple",
    storage_path: "/manus-storage/image000002_std_ff5124df.jpg",
    description: "Multiple phlox clusters showing color progression",
    date: "May 26, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "phlox_03",
    variety: "Phlox",
    type: "filler",
    color: "Purple",
    storage_path: "/manus-storage/image000003_std_5c791ead.jpg",
    description: "Tall phlox stems with multiple flower clusters",
    date: "May 26, 2026",
    section: ["in_the_ground"],
  },
  {
    id: "echinacea_01",
    variety: "Echinacea",
    type: "focal",
    color: "Pink/Purple",
    storage_path: "/manus-storage/image000004_1_std_71a89194.jpg",
    description: "Echinacea with distinctive cone center and pink petals",
    date: "May 26, 2026",
    section: ["bloom_diary", "gallery"],
  },
  {
    id: "gaura_01",
    variety: "Gaura",
    type: "filler",
    color: "Pink/White",
    storage_path: "/manus-storage/image000005_std_d9d83b8b.jpg",
    description: "Gaura flower detail showing delicate pink and white petals",
    date: "May 26, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "gaura_02",
    variety: "Gaura",
    type: "filler",
    color: "Pink/White",
    storage_path: "/manus-storage/image000005_1_std_7120e17c.jpg",
    description: "Gaura plant with multiple flower spikes",
    date: "May 26, 2026",
    section: ["in_the_ground"],
  },
  {
    id: "gaura_03",
    variety: "Gaura",
    type: "filler",
    color: "Pink/White",
    storage_path: "/manus-storage/image000005_2_std_d279d793.jpg",
    description: "Gaura flowers with buds and blooms at night",
    date: "May 26, 2026",
    section: ["bloom_diary"],
  },
  {
    id: "lamb_ear_01",
    variety: "Lamb's Ear",
    type: "foliage",
    color: "Purple/Silver",
    storage_path: "/manus-storage/image000009_std_7f62c863.jpg",
    description: "Lamb's Ear flower spike with purple blooms and silvery foliage",
    date: "May 26, 2026",
    section: ["in_the_ground", "gallery"],
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

export default function MasterGallery() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState<"all" | "filler" | "focal" | "foliage">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedFlower, setSelectedFlower] = useState<GalleryFlower | null>(null);

  const filtered = selectedType === "all" ? ALL_FLOWERS : ALL_FLOWERS.filter((f) => f.type === selectedType);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      {/* Hero */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-pink-100 to-rose-100 opacity-40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            The Complete Gallery
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl mx-auto">
            {ALL_FLOWERS.length} standardized, award-winning photographs of Red Dirt Blooms varieties.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 py-4 px-4 md:px-8 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "filler", "focal", "foliage"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedType === type
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type === "all" ? "All" : TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((flower) => (
                <div
                  key={flower.id}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1"
                  onClick={() => setSelectedFlower(flower)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={flower.storage_path}
                      alt={flower.variety}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-xs font-bold bg-gradient-to-r ${
                        TYPE_COLORS[flower.type]
                      }`}
                    >
                      {TYPE_LABELS[flower.type]}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-slate-900">{flower.variety}</h3>
                    <p className="text-xs text-slate-600">{flower.color}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(flower.id);
                      }}
                      className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      {favorites.has(flower.id) ? "♥ Favorited" : "♡ Favorite"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((flower) => (
                <div
                  key={flower.id}
                  onClick={() => setSelectedFlower(flower)}
                  className="group cursor-pointer bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex gap-4 items-center"
                >
                  <img
                    src={flower.storage_path}
                    alt={flower.variety}
                    className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{flower.variety}</h3>
                    <p className="text-sm text-slate-600">{flower.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${TYPE_COLORS[flower.type]}`}>
                        {TYPE_LABELS[flower.type]}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">{flower.color}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(flower.id);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Heart size={20} fill={favorites.has(flower.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedFlower && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFlower(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{selectedFlower.variety}</h2>
              <button
                onClick={() => setSelectedFlower(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedFlower.storage_path}
                alt={selectedFlower.variety}
                className="w-full rounded-lg mb-6"
              />
              <p className="text-slate-700 mb-4">{selectedFlower.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600">Color</p>
                  <p className="font-semibold text-slate-900">{selectedFlower.color}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="font-semibold text-slate-900">{TYPE_LABELS[selectedFlower.type]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Captured</p>
                  <p className="font-semibold text-slate-900">{selectedFlower.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Sections</p>
                  <p className="font-semibold text-slate-900">{selectedFlower.section.join(", ")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleFavorite(selectedFlower.id)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    favorites.has(selectedFlower.id)
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Heart size={18} fill={favorites.has(selectedFlower.id) ? "currentColor" : "none"} />
                  {favorites.has(selectedFlower.id) ? "Favorited" : "Favorite"}
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
