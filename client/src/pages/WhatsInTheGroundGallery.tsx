/**
 * Red Dirt Blooms — What's In The Ground Gallery
 * Bold, vibrant showcase of flowers currently growing on the farm
 * Strategic rule-breaking design with epic UX
 */

import { useState } from "react";
import { Sprout, TrendingUp, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";

interface GroundFlower {
  id: string;
  variety: string;
  description: string;
  stage: number; // 0-100
  eta: string;
  planted_date: string;
  expected_harvest: string;
  storage_path: string;
  color: string;
  characteristics: string[];
}

const IN_GROUND: GroundFlower[] = [
  {
    id: "yarrow_ground",
    variety: "Yarrow",
    description: "Dense clusters of tiny flowers in vibrant purples and pinks. A premium filler that adds texture and movement to arrangements.",
    stage: 85,
    eta: "Ready to cut",
    planted_date: "April 15, 2026",
    expected_harvest: "May 26, 2026",
    storage_path: "/manus-storage/IMG_0352_std_9dea187b.jpg",
    color: "Purple/Pink",
    characteristics: ["Filler", "Long-lasting", "Organic", "Premium"],
  },
  {
    id: "phlox_ground",
    variety: "Phlox",
    description: "Delicate, fragrant blooms clustered in dense heads. Perfect for adding color and fragrance to any arrangement.",
    stage: 90,
    eta: "Ready to cut",
    planted_date: "April 10, 2026",
    expected_harvest: "May 20, 2026",
    storage_path: "/manus-storage/image000002_std_ff5124df.jpg",
    color: "Purple",
    characteristics: ["Filler", "Fragrant", "Organic", "Premium"],
  },
  {
    id: "zinnia_ground",
    variety: "Zinnia",
    description: "Bold, full-faced blooms in vibrant colors. Zinnias are the workhorse of the farm — reliable, stunning, and beloved by florists.",
    stage: 75,
    eta: "~1 week",
    planted_date: "April 5, 2026",
    expected_harvest: "June 2, 2026",
    storage_path: "/manus-storage/IMG_0369_std_ddb64d70.jpg",
    color: "Yellow/Red",
    characteristics: ["Focal", "Vibrant", "Organic", "Premium"],
  },
  {
    id: "echinacea_ground",
    variety: "Echinacea",
    description: "Distinctive cone-centered blooms with delicate petals. A focal flower that commands attention in any arrangement.",
    stage: 70,
    eta: "~2 weeks",
    planted_date: "April 8, 2026",
    expected_harvest: "June 5, 2026",
    storage_path: "/manus-storage/image000004_1_std_71a89194.jpg",
    color: "Pink/Purple",
    characteristics: ["Focal", "Distinctive", "Organic", "Premium"],
  },
  {
    id: "gaura_ground",
    variety: "Gaura",
    description: "Delicate, airy stems with small pink and white flowers. Gaura adds movement and lightness to arrangements.",
    stage: 65,
    eta: "~2-3 weeks",
    planted_date: "April 12, 2026",
    expected_harvest: "June 8, 2026",
    storage_path: "/manus-storage/image000005_std_d9d83b8b.jpg",
    color: "Pink/White",
    characteristics: ["Filler", "Airy", "Organic", "Premium"],
  },
  {
    id: "lamb_ear_ground",
    variety: "Lamb's Ear",
    description: "Silvery-green foliage with delicate purple flower spikes. A textural element that adds depth and sophistication.",
    stage: 60,
    eta: "~3 weeks",
    planted_date: "April 18, 2026",
    expected_harvest: "June 10, 2026",
    storage_path: "/manus-storage/image000009_std_7f62c863.jpg",
    color: "Purple/Silver",
    characteristics: ["Foliage", "Textural", "Organic", "Premium"],
  },
];

const STAGE_COLOR = (stage: number) => {
  if (stage >= 80) return "from-emerald-500 to-teal-600";
  if (stage >= 60) return "from-amber-500 to-orange-600";
  if (stage >= 40) return "from-sky-500 to-blue-600";
  return "from-slate-400 to-slate-500";
};

const STAGE_LABEL = (stage: number) => {
  if (stage >= 80) return "Nearly Ready";
  if (stage >= 60) return "Developing";
  if (stage >= 40) return "Growing";
  return "Early Stage";
};

export default function WhatsInTheGroundGallery() {
  const [selectedFlower, setSelectedFlower] = useState<GroundFlower | null>(IN_GROUND[0]);
  const [sortBy, setSortBy] = useState<"stage" | "eta" | "variety">("stage");

  const sortedFlowers = [...IN_GROUND].sort((a, b) => {
    if (sortBy === "stage") return b.stage - a.stage;
    if (sortBy === "eta") {
      const aEta = parseInt(a.eta.match(/\d+/)?.[0] || "999");
      const bEta = parseInt(b.eta.match(/\d+/)?.[0] || "999");
      return aEta - bEta;
    }
    return a.variety.localeCompare(b.variety);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white pt-20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 opacity-40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sprout size={40} className="text-emerald-600" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                What's In The Ground
              </h1>
            </div>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              Real-time updates on what's growing right now on the farm. Track the journey from seed to harvest.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Flower (Large) */}
      {selectedFlower && (
        <section className="px-4 md:px-8 mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-200">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={selectedFlower.storage_path}
                    alt={selectedFlower.variety}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold text-sm bg-gradient-to-r ${STAGE_COLOR(selectedFlower.stage)}`}>
                    {STAGE_LABEL(selectedFlower.stage)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">{selectedFlower.variety}</h2>
                    <p className="text-lg text-slate-600 mb-6">{selectedFlower.color}</p>

                    {/* Growth Progress */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700">Growth Progress</span>
                        <span className="text-2xl font-bold text-emerald-600">{selectedFlower.stage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${STAGE_COLOR(selectedFlower.stage)} transition-all duration-500`}
                          style={{ width: `${selectedFlower.stage}%` }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl mb-6 border-l-4 border-emerald-500">
                      <p className="text-slate-800 leading-relaxed">{selectedFlower.description}</p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar size={20} className="text-emerald-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Planted</span>
                          <p className="text-sm text-slate-700">{selectedFlower.planted_date}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap size={20} className="text-amber-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Expected Harvest</span>
                          <p className="text-sm text-slate-700">{selectedFlower.expected_harvest}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp size={20} className="text-teal-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-semibold text-slate-600">ETA</span>
                          <p className="text-sm text-slate-700">{selectedFlower.eta}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="mt-8">
                    <h3 className="font-semibold text-slate-900 mb-3">Characteristics</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFlower.characteristics.map((char) => (
                        <span
                          key={char}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sorting Controls */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-slate-900">All Varieties In Ground</h2>
            <div className="flex gap-2">
              {(["stage", "eta", "variety"] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    sortBy === sort
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Sort by {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-4 md:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFlowers.map((flower) => (
              <div
                key={flower.id}
                onClick={() => setSelectedFlower(flower)}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={flower.storage_path}
                    alt={flower.variety}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${STAGE_COLOR(flower.stage)}`}>
                    {flower.stage}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{flower.variety}</h3>
                  <p className="text-sm text-slate-600 mb-4">{flower.color}</p>

                  {/* Mini Progress */}
                  <div className="mb-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${STAGE_COLOR(flower.stage)}`}
                        style={{ width: `${flower.stage}%` }}
                      />
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Zap size={16} className="text-amber-600" />
                    <span className="font-medium">{flower.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 mb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Subscribe to Updates</h2>
          <p className="text-lg mb-8 opacity-95">
            Get weekly notifications when flowers are ready to harvest and available at the Harvest Stand.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("You're subscribed! 🌱");
            }}
            className="flex gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:shadow-xl transition-all"
            >
              Notify Me
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
