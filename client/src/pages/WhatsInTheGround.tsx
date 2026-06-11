/**
 * Red Dirt Blooms — What's in the Ground
 * Redesigned layout: sticky sidebar filters, tag chips, sort controls, improved cards.
 *
 * TO ADD A PHOTO: Upload with `manus-upload-file --webdev path/to/photo.jpg`
 * then replace null with the returned /manus-storage/... URL.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sprout, Clock, Mail, Flower2, X, Loader2, Camera, ChevronDown, ChevronUp,
  Search, SlidersHorizontal, ArrowUpDown, Filter
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const HERO_FIELD = "https://d2xsxph8kpxj0f.cloudfront.net/106321113/oKaw6F2tCcS6GS9c4BJX8L/bloom-diary-6ogmYoPwmfDbMqCafamNte.webp";

const VARIETIES = [
  // ── BASILS ──
  {
    name: "Basil — Cinnamon",
    latin: "Ocimum basilicum 'Cinnamon'",
    category: "Basil",
    desc: "Bright green leaves with reddish-purple stems and a warm cinnamon-spice fragrance. A sensory standout in any herb bouquet or fragrant arrangement.",
    stage: 65, stageLabel: "Harvest", eta: "Ready now", color: "#A05A30",
    img: null,
    tags: ["Herb Foliage", "Fragrant", "Warm Scent"],
    vaseLife: "5–7 days", stemLength: "12–18 in",
    designUse: "Herb bouquets, fragrant arrangements, market bunches",
    careTip: "Keep at room temperature; never refrigerate basil stems.",
    season: "Summer through fall", fragrance: "Warm cinnamon-spice",
  },
  {
    name: "Basil — Dark Opal Purple",
    latin: "Ocimum basilicum 'Dark Opal'",
    category: "Basil",
    desc: "Deep burgundy-purple foliage with a glossy sheen. One of the most striking foliage stems available — adds dramatic color contrast and a sweet-spicy fragrance.",
    stage: 70, stageLabel: "Harvest", eta: "Ready now", color: "#6A3A6A",
    img: null,
    tags: ["Herb Foliage", "Fragrant", "Purple"],
    vaseLife: "5–7 days", stemLength: "12–18 in",
    designUse: "Foliage accent, herb bouquets, color contrast, wedding work",
    careTip: "Never refrigerate — keep at room temperature in water to prevent blackening.",
    season: "Summer through fall", fragrance: "Sweet-spicy basil",
  },
  {
    name: "Basil — Thai",
    latin: "Ocimum basilicum var. thyrsiflora",
    category: "Basil",
    desc: "Glossy green leaves with purple stems and delicate purple flower spikes. Adds an anise-licorice fragrance and fine texture to herb and mixed arrangements.",
    stage: 68, stageLabel: "Harvest", eta: "Ready now", color: "#5A8C5A",
    img: null,
    tags: ["Herb Foliage", "Fragrant", "Fine Texture"],
    vaseLife: "5–7 days", stemLength: "12–18 in",
    designUse: "Herb bouquets, texture filler, fragrant arrangements, market bunches",
    careTip: "Keep at room temperature; harvest in the morning for best fragrance.",
    season: "Summer through fall", fragrance: "Anise-licorice",
  },
  {
    name: "Basil — Tulsi (Holy Basil)",
    latin: "Ocimum tenuiflorum 'Tulsi'",
    category: "Basil",
    desc: "Sacred herb with small purple-tinged leaves and delicate flower spikes. Adds an exotic, spicy-clove fragrance and fine texture to herb bouquets.",
    stage: 70, stageLabel: "Harvest", eta: "Ready now", color: "#7A8C6E",
    img: null,
    tags: ["Herb Foliage", "Fragrant", "Unique"],
    vaseLife: "5–7 days", stemLength: "12–18 in",
    designUse: "Herb bouquets, fragrant arrangements, texture filler, farmers market bunches",
    careTip: "Keep at room temperature — basil blackens if refrigerated.",
    season: "Summer through fall", fragrance: "Strong spicy-clove",
  },
  // ── CELOSIAS ──
  {
    name: "Celosia — Celway Purple",
    latin: "Celosia argentea 'Celway Purple'",
    category: "Celosia",
    desc: "Deep jewel-purple cockscomb with a rich, velvety texture. Adds dramatic depth to arrangements and holds its color beautifully when dried.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#6A3A8A",
    img: null,
    tags: ["Cockscomb", "Jewel Tone", "Dried"],
    vaseLife: "14–21 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Focal accent, jewel-tone arrangements, dried work, wedding designs",
    careTip: "Keep water level low; avoid wetting the crest to prevent rot.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Celway Red",
    latin: "Celosia argentea 'Celway Red'",
    category: "Celosia",
    desc: "Vivid scarlet cockscomb with a dense, velvety crest. The Celway series is bred specifically for cut flower production — uniform stems and exceptional vase life.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#C0392B",
    img: null,
    tags: ["Cockscomb", "Cut Flower Grade", "Dried"],
    vaseLife: "14–21 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Focal accent, dried arrangements, fall designs, wedding work",
    careTip: "Keep water level low — cockscomb stems rot if submerged too deep.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Celway Terracotta",
    latin: "Celosia argentea 'Celway Terracotta'",
    category: "Celosia",
    desc: "Warm terracotta-orange cockscomb with earthy, sun-baked tones. One of the most on-trend colors in floral design — perfect for fall and boho aesthetics.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#C4682A",
    img: null,
    tags: ["Cockscomb", "Trending", "Dried"],
    vaseLife: "14–21 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Focal accent, fall designs, boho arrangements, dried work",
    careTip: "Harvest when crest is fully formed; terracotta tones deepen slightly when dried.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Celway White",
    latin: "Celosia argentea 'Celway White'",
    category: "Celosia",
    desc: "Crisp white cockscomb crest with a clean, modern look. Versatile in both fresh and dried arrangements — pairs beautifully with any color palette.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#C8C0B0",
    img: null,
    tags: ["Cockscomb", "Neutral", "Dried"],
    vaseLife: "14–21 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Neutral accent, wedding work, dried arrangements, modern designs",
    careTip: "Keep water level low; white varieties show water marks — keep crest dry.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Chief Carmine",
    latin: "Celosia argentea 'Chief Carmine'",
    category: "Celosia",
    desc: "Deep carmine-red plume celosia from the Chief series — bred for tall, uniform stems and exceptional cut flower performance. Rich jewel-tone color that holds beautifully fresh or dried.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#A0192A",
    img: null,
    tags: ["Plume", "Cut Flower Grade", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, fall designs, dramatic bouquets, dried arrangements",
    careTip: "Harvest when plume is 2/3 open; hang upside down to dry for best form.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Chief Fire",
    latin: "Celosia argentea 'Chief Fire'",
    category: "Celosia",
    desc: "Blazing orange-red plume from the Chief series — one of the most vibrant celosias grown. Tall, strong stems with dense feathery plumes that command attention in any arrangement.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#D94010",
    img: null,
    tags: ["Plume", "Cut Flower Grade", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, fall harvest bouquets, market bunches, dried wreaths",
    careTip: "Harvest when plume is 2/3 open for longest vase life and best dried form.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Chief Gold",
    latin: "Celosia argentea 'Chief Gold'",
    category: "Celosia",
    desc: "Warm golden-yellow plume celosia from the Chief series. Bright and cheerful — pairs beautifully with deep burgundies and terracottas for fall harvest designs.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#D4A020",
    img: null,
    tags: ["Plume", "Cut Flower Grade", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, fall arrangements, market bunches, dried work",
    careTip: "Harvest when plume is 2/3 open; gold tones deepen slightly when dried.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Chief Persimmon",
    latin: "Celosia argentea 'Chief Persimmon'",
    category: "Celosia",
    desc: "Rich persimmon-orange plume from the Chief series — a warm, earthy tone that bridges red and orange. One of the most versatile fall harvest colors grown at Red Dirt Blooms.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#D4601A",
    img: null,
    tags: ["Plume", "Cut Flower Grade", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, fall designs, boho arrangements, dried work",
    careTip: "Harvest when plume is 2/3 open; persimmon tones are stunning in dried wreaths.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Forest Fire",
    latin: "Celosia argentea 'Forest Fire'",
    category: "Celosia",
    desc: "Brilliant scarlet-red plumes with deep burgundy foliage — one of the most dramatic celosias available. Intense color that commands attention.",
    stage: 50, stageLabel: "Growing", eta: "~3 weeks", color: "#C0392B",
    img: null,
    tags: ["Plume", "Bold Color", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, fall designs, dramatic bouquets, dried wreaths",
    careTip: "Condition in warm water overnight; the colored foliage is as valuable as the plume.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Karmer's Lemon Lime",
    latin: "Celosia argentea 'Karmer's Lemon Lime'",
    category: "Celosia",
    desc: "Striking chartreuse-to-lime crested cockscomb — a true conversation piece. Pairs brilliantly with deep purples and burgundies for high-contrast designs.",
    stage: 40, stageLabel: "Growing", eta: "~4 weeks", color: "#8FB840",
    img: null,
    tags: ["Cockscomb", "Unique", "Contrast"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Accent, editorial, high-contrast arrangements, dried work",
    careTip: "Keep water level low; avoid wetting the crest to prevent rot.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Limonata",
    latin: "Celosia argentea 'Limonata'",
    category: "Celosia",
    desc: "Chartreuse-yellow crested cockscomb with a velvety brain-like texture. Rare and unexpected — florists love it for editorial and high-end work.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#A8B840",
    img: null,
    tags: ["Cockscomb", "Unique", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Texture accent, editorial work, dried arrangements, boutonnières",
    careTip: "Keep water level low — cockscomb stems rot easily if submerged too deep.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Pampas Plume",
    latin: "Celosia argentea 'Pampas Plume'",
    category: "Celosia",
    desc: "Soft, feathery plumes in muted blush and cream tones that mimic the look of pampas grass. Highly sought after for boho and neutral-palette designs.",
    stage: 40, stageLabel: "Growing", eta: "~4 weeks", color: "#D4A8A0",
    img: null,
    tags: ["Plume", "Boho", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Boho arrangements, dried designs, neutral-palette bouquets, pampas substitute",
    careTip: "Dry upside down in small bunches for the most natural pampas-like form.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Pink Flamingo",
    latin: "Celosia argentea 'Pink Flamingo'",
    category: "Celosia",
    desc: "Tall feathery plumes in vivid flamingo-pink. Stunning fresh and dries beautifully — a two-season flower that holds its color for months.",
    stage: 50, stageLabel: "Growing", eta: "~3 weeks", color: "#E87AA0",
    img: null,
    tags: ["Plume", "Dried", "Tall"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "24–36 in",
    designUse: "Focal plume, dried arrangements, fall designs, large installations",
    careTip: "Harvest when plume is 2/3 open; hang upside down in a dry space to dry perfectly.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Sunday Mix",
    latin: "Celosia argentea 'Sunday Mix'",
    category: "Celosia",
    desc: "A vibrant mix of plume celosias in red, orange, yellow, and pink. Ideal for market bunches and mixed arrangements with a wild, joyful energy.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#E8601A",
    img: null,
    tags: ["Plume", "Mix", "Market"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "20–30 in",
    designUse: "Mixed market bunches, filler plume, colorful arrangements",
    careTip: "Harvest when plume is 2/3 open for longest vase life.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Celosia — Vintage Rose",
    latin: "Celosia argentea 'Vintage Rose'",
    category: "Celosia",
    desc: "Dusty rose-mauve crested cockscomb with an antique, muted palette that pairs beautifully with dried grasses and neutral tones.",
    stage: 45, stageLabel: "Growing", eta: "~3–4 weeks", color: "#C08090",
    img: null,
    tags: ["Cockscomb", "Romantic", "Dried"],
    vaseLife: "10–14 days fresh; months dried", stemLength: "18–24 in",
    designUse: "Texture accent, romantic bouquets, dried arrangements, wedding work",
    careTip: "Keep water level low; harvest when crest is fully formed for best dried specimens.",
    season: "Summer through fall", fragrance: "None",
  },
  // ── GOMPHRENA ──
  {
    name: "Gomphrena — Audray Pink",
    latin: "Gomphrena globosa 'Audray Pink'",
    category: "Gomphrena",
    desc: "Soft candy-pink globe blooms on tall branching stems. The Audray series is bred for cut flower production — longer stems and larger globes than standard gomphrena.",
    stage: 40, stageLabel: "Growing", eta: "~4 weeks", color: "#E87AA0",
    img: null,
    tags: ["Dried", "Filler", "Everlasting"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "18–24 in",
    designUse: "Filler, dried arrangements, wedding work, boutonnières, everlasting bouquets",
    careTip: "Harvest when globes are fully colored and firm; air-dry upside down in small bunches.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Gomphrena — Audray Purple-Red",
    latin: "Gomphrena globosa 'Audray Purple-Red'",
    category: "Gomphrena",
    desc: "Rich magenta-purple-red globes with intense jewel-tone color. One of the deepest, most saturated gomphrena colors available — stunning in both fresh and dried work.",
    stage: 40, stageLabel: "Growing", eta: "~4 weeks", color: "#8B2252",
    img: null,
    tags: ["Dried", "Filler", "Jewel Tone"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "18–24 in",
    designUse: "Filler, jewel-tone arrangements, dried work, fall designs, wedding accents",
    careTip: "Harvest when globes are fully colored; color intensifies slightly when dried.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Gomphrena — Audray White",
    latin: "Gomphrena globosa 'Audray White'",
    category: "Gomphrena",
    desc: "Clean white globe blooms on tall Audray-series stems. A versatile neutral that pairs with every color palette — fresh or dried, it never goes out of style.",
    stage: 40, stageLabel: "Growing", eta: "~4 weeks", color: "#C8C0B0",
    img: null,
    tags: ["Dried", "Filler", "Neutral"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "18–24 in",
    designUse: "Neutral filler, wedding work, dried arrangements, mixed bouquets",
    careTip: "Harvest when globes are firm and fully white; avoid over-watering to keep stems strong.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Gomphrena — Purple",
    latin: "Gomphrena globosa 'Purple'",
    category: "Gomphrena",
    desc: "Classic bright purple globe blooms — the original gomphrena that florists have relied on for decades. Vivid, reliable, and holds color indefinitely when dried.",
    stage: 42, stageLabel: "Growing", eta: "~4 weeks", color: "#7A5C8C",
    img: null,
    tags: ["Dried", "Filler", "Classic"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "12–18 in",
    designUse: "Filler, dried arrangements, wreaths, everlasting bouquets, boutonnières",
    careTip: "Harvest when globes are fully colored and firm; air-dry upside down.",
    season: "Summer through fall", fragrance: "None",
  },
  // ── MARIGOLDS ──
  {
    name: "Marigold — Orange Lei",
    latin: "Tagetes erecta 'Orange Lei'",
    category: "Marigold",
    desc: "Vibrant orange pompom blooms with a classic marigold form. Large, fully double heads on strong stems — a workhorse for fall arrangements and garlands.",
    stage: 35, stageLabel: "Growing", eta: "~4–5 weeks", color: "#E8701A",
    img: null,
    tags: ["Focal", "Fragrant", "Fall"],
    vaseLife: "7–10 days", stemLength: "18–24 in",
    designUse: "Focal bloom, fall arrangements, garlands, Day of the Dead, market bunches",
    careTip: "Remove lower foliage to reduce the strong scent if desired; condition overnight in cool water.",
    season: "Summer through fall", fragrance: "Strong earthy-marigold",
  },
  {
    name: "Marigold — Red Metamorphosis",
    latin: "Tagetes erecta 'Red Metamorphosis'",
    category: "Marigold",
    desc: "Deep mahogany-red marigold with rich, velvety petals. One of the darkest marigold varieties available — adds dramatic depth to fall and Halloween arrangements.",
    stage: 35, stageLabel: "Growing", eta: "~4–5 weeks", color: "#8B2020",
    img: null,
    tags: ["Focal", "Fragrant", "Dark Color"],
    vaseLife: "7–10 days", stemLength: "18–24 in",
    designUse: "Focal bloom, dramatic fall designs, Day of the Dead, high-contrast arrangements",
    careTip: "Remove lower foliage; harvest when blooms are 3/4 open for longest vase life.",
    season: "Summer through fall", fragrance: "Strong earthy-marigold",
  },
  {
    name: "Marigold — Sparkler",
    latin: "Tagetes erecta 'Sparkler'",
    category: "Marigold",
    desc: "Multi-petaled bicolor marigold in orange and yellow with a crested center. The Sparkler's unique petal structure catches light beautifully — a true showstopper at market.",
    stage: 35, stageLabel: "Growing", eta: "~4–5 weeks", color: "#E8A020",
    img: null,
    tags: ["Focal", "Fragrant", "Unique"],
    vaseLife: "7–10 days", stemLength: "18–24 in",
    designUse: "Focal bloom, mixed bouquets, market bunches, fall arrangements",
    careTip: "Harvest when fully open; the multi-petaled form is most impressive at peak bloom.",
    season: "Summer through fall", fragrance: "Strong earthy-marigold",
  },
  // ── STRAWFLOWERS ──
  {
    name: "Strawflower — Apricot",
    latin: "Xerochrysum bracteatum 'Apricot'",
    category: "Strawflower",
    desc: "Warm apricot-peach blooms with a golden center. One of the most requested strawflower colors — pairs beautifully with dried grasses and neutral foliage.",
    stage: 60, stageLabel: "Bud", eta: "~2 weeks", color: "#E8A070",
    img: null,
    tags: ["Dried", "Everlasting", "Warm Tones"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "12–18 in",
    designUse: "Dried arrangements, fall designs, wedding work, wreaths",
    careTip: "Wire stems before drying for easier use in wreaths and installations.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Strawflower — Mixed Colors",
    latin: "Xerochrysum bracteatum 'Mixed'",
    category: "Strawflower",
    desc: "A full spectrum mix of strawflower colors — red, orange, yellow, pink, white, and purple. Perfect for market bunches and dried arrangements with maximum variety.",
    stage: 55, stageLabel: "Bud", eta: "~2–3 weeks", color: "#D4688A",
    img: null,
    tags: ["Dried", "Everlasting", "Mix"],
    vaseLife: "14+ days fresh; indefinite dried", stemLength: "12–18 in",
    designUse: "Dried arrangements, wreaths, everlasting bouquets, boutonnières, filler",
    careTip: "Harvest when blooms are 1/2 to 3/4 open — they continue to open after cutting.",
    season: "Summer through fall", fragrance: "None",
  },
  // ── VERBASCUM ──
  {
    name: "Verbascum — Shades of Summer",
    latin: "Verbascum 'Shades of Summer'",
    category: "Verbascum",
    desc: "Tall architectural spires with small blooms in warm yellow, peach, and apricot tones. Adds dramatic height and a wildflower-meadow character to large arrangements.",
    stage: 55, stageLabel: "Bud", eta: "~2–3 weeks", color: "#D4A040",
    img: null,
    tags: ["Spike", "Tall", "Architectural"],
    vaseLife: "7–10 days", stemLength: "30–48 in",
    designUse: "Tall spike accent, large arrangements, wedding arches, garden-style designs",
    careTip: "Harvest when 1/3 of the spike blooms are open; place in deep water immediately.",
    season: "Late spring through summer", fragrance: "None",
  },
  // ── ZINNIAS ──
  {
    name: "Zinnia — Cactus",
    latin: "Zinnia elegans 'Cactus'",
    category: "Zinnia",
    desc: "Spiky, quilled petals in a wild mix of orange, red, yellow, and pink — like a cactus flower in full bloom. Adds dramatic texture unlike any standard zinnia.",
    stage: 50, stageLabel: "Growing", eta: "~3 weeks", color: "#E8601A",
    img: null,
    tags: ["Focal", "Texture", "Unique"],
    vaseLife: "7–12 days", stemLength: "20–28 in",
    designUse: "Focal bloom, texture accent, mixed bouquets, garden-style designs",
    careTip: "Harvest when fully open; the quilled petals hold their shape best when cut at peak bloom.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Zinnia — Exquisite",
    latin: "Zinnia elegans 'Exquisite'",
    category: "Zinnia",
    desc: "Bicolor blooms with rich raspberry-red petals tipped in creamy white — a show-stopping variety that photographs beautifully.",
    stage: 55, stageLabel: "Bud", eta: "~2–3 weeks", color: "#B5451B",
    img: null,
    tags: ["Focal", "Bicolor", "Unique"],
    vaseLife: "7–12 days", stemLength: "22–28 in",
    designUse: "Focal bloom, statement bouquets, editorial arrangements",
    careTip: "Harvest when fully open; zinnias do not continue to open after cutting.",
    season: "Summer through fall", fragrance: "None",
  },
  {
    name: "Zinnia — Giant Pink",
    latin: "Zinnia elegans 'Giant Pink'",
    category: "Zinnia",
    desc: "Large, fully double blooms in warm candy-pink with strong 24–30 inch stems. A florist favorite for its generous size and long vase life.",
    stage: 60, stageLabel: "Bud", eta: "~2 weeks", color: "#D4688A",
    img: null,
    tags: ["Focal", "Bold Color"],
    vaseLife: "7–12 days", stemLength: "24–30 in",
    designUse: "Focal bloom, mixed bouquets, wedding work, market bunches",
    careTip: "Harvest when blooms are fully open; re-cut stems and change water every 2 days.",
    season: "Summer through fall", fragrance: "None",
  },
];

const STAGES = ["Seedling", "Growing", "Bud", "Bloom", "Harvest"];
const CATEGORIES = ["All", "Basil", "Celosia", "Gomphrena", "Marigold", "Strawflower", "Verbascum", "Zinnia"];
const ALL_TAGS = [
  "Architectural", "Bicolor", "Boho", "Bold Color", "Classic", "Cockscomb", "Contrast",
  "Cut Flower Grade", "Dark Color", "Dried", "Everlasting", "Fall", "Filler", "Fine Texture",
  "Focal", "Fragrant", "Herb Foliage", "Jewel Tone", "Market", "Mix", "Neutral",
  "Plume", "Purple", "Romantic", "Spike", "Tall", "Texture", "Trending", "Unique", "Warm Tones",
];

const SORT_OPTIONS = [
  { value: "alpha", label: "A – Z" },
  { value: "stage-asc", label: "Closest to Harvest" },
  { value: "stage-desc", label: "Earliest Stage" },
  { value: "category", label: "By Flower Type" },
];

const STAGE_ORDER: Record<string, number> = {
  Seedling: 1, Growing: 2, Bud: 3, Bloom: 4, Harvest: 5,
};

const CATEGORY_COLORS: Record<string, string> = {
  Basil: "#7A8C6E",
  Celosia: "#C0392B",
  Gomphrena: "#8B2252",
  Marigold: "#E8701A",
  Strawflower: "#E8A070",
  Verbascum: "#D4A040",
  Zinnia: "#D4688A",
};

function useIntersection(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function BloomBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref);
  return (
    <div ref={ref} className="h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000"
        style={{ width: visible ? `${pct}%` : "0%", background: color }} />
    </div>
  );
}

function PhotoPlaceholder({ color }: { color: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: color + "18" }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: color + "30" }}>
        <Camera className="w-5 h-5" style={{ color }} />
      </div>
      <span className="font-body text-[10px] font-medium" style={{ color: color + "80" }}>Photo coming soon</span>
    </div>
  );
}

export default function WhatsInTheGround() {
  const [notified, setNotified] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariety, setModalVariety] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [globalEmail, setGlobalEmail] = useState("");
  const [pendingVariety, setPendingVariety] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("alpha");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const subscribeMutation = trpc.bloomWatch.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (pendingVariety) {
        setNotified((prev) => { const next = new Set(prev); next.add(pendingVariety); return next; });
        setPendingVariety(null);
      }
      setModalOpen(false);
      setModalEmail("");
      setGlobalEmail("");
    },
    onError: (err) => {
      toast.error("Couldn't sign you up: " + err.message);
      setPendingVariety(null);
    },
  });

  const handleNotify = (name: string) => { setModalVariety(name); setModalEmail(""); setModalOpen(true); };
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail) return;
    setPendingVariety(modalVariety);
    subscribeMutation.mutate({ email: modalEmail, source: `wake-me-${modalVariety.toLowerCase().replace(/\s+/g, "-")}` });
  };
  const handleGlobalSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalEmail) return;
    subscribeMutation.mutate({ email: globalEmail, source: "whats-in-the-ground-global" });
  };
  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };
  const clearAll = () => {
    setSearchQuery(""); setStageFilter("All"); setActiveCategory("All"); setActiveTags(new Set());
  };
  const hasFilters = searchQuery || stageFilter !== "All" || activeCategory !== "All" || activeTags.size > 0;

  const filtered = useMemo(() => {
    let results = [...VARIETIES];
    if (activeCategory !== "All") results = results.filter((v) => v.category === activeCategory);
    if (stageFilter !== "All") results = results.filter((v) => v.stageLabel === stageFilter);
    if (activeTags.size > 0) results = results.filter((v) => Array.from(activeTags).every((t) => v.tags.includes(t)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (v) => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.tags.some((t) => t.toLowerCase().includes(q)) || v.desc.toLowerCase().includes(q)
      );
    }
    // Sort
    if (sortBy === "alpha") results.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "stage-asc") results.sort((a, b) => (STAGE_ORDER[b.stageLabel] ?? 0) - (STAGE_ORDER[a.stageLabel] ?? 0));
    else if (sortBy === "stage-desc") results.sort((a, b) => (STAGE_ORDER[a.stageLabel] ?? 0) - (STAGE_ORDER[b.stageLabel] ?? 0));
    else if (sortBy === "category") results.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return results;
  }, [activeCategory, stageFilter, activeTags, searchQuery, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: VARIETIES.length };
    VARIETIES.forEach((v) => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return counts;
  }, []);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide block mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2A1F1A]/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Variety, tag, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-[#F5F0E8] border border-[#B5451B]/15 rounded font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/30 focus:outline-none focus:border-[#B5451B]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={14} className="text-[#2A1F1A]/40" />
            </button>
          )}
        </div>
      </div>

      {/* Flower Type */}
      <div>
        <label className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide block mb-2">Flower Type</label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-body transition-colors ${
                activeCategory === cat
                  ? "bg-[#B5451B] text-white font-semibold"
                  : "text-[#2A1F1A]/70 hover:bg-[#B5451B]/8"
              }`}
            >
              <div className="flex items-center gap-2">
                {cat !== "All" && (
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] || "#B5451B" }} />
                )}
                <span>{cat}</span>
              </div>
              <span className={`text-xs ${activeCategory === cat ? "text-white/70" : "text-[#2A1F1A]/30"}`}>
                {categoryCounts[cat] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Growth Stage */}
      <div>
        <label className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide block mb-2">Growth Stage</label>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...STAGES].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                stageFilter === stage
                  ? "bg-[#B5451B] text-white border-[#B5451B]"
                  : "bg-white text-[#2A1F1A]/60 border-[#B5451B]/20 hover:border-[#B5451B]/50"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="font-body text-xs font-semibold text-[#2A1F1A]/50 uppercase tracking-wide block mb-2">
          Tags {activeTags.size > 0 && <span className="text-[#B5451B]">({activeTags.size} active)</span>}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`font-body text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${
                activeTags.has(tag)
                  ? "bg-[#2A1F1A] text-white border-[#2A1F1A]"
                  : "bg-white text-[#2A1F1A]/50 border-[#B5451B]/15 hover:border-[#B5451B]/40 hover:text-[#2A1F1A]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="w-full font-body text-xs text-[#B5451B] border border-[#B5451B]/30 rounded py-2 hover:bg-[#B5451B]/5 transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8] pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative py-20">
        <img src={HERO_FIELD} alt="What's in the Ground" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A1F1A]/60 to-[#2A1F1A]/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="font-accent text-[#E8A020] text-xl mb-3">Growing Now</div>
          <h1 className="font-heading text-[#F5F0E8] font-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            What's in the Ground
          </h1>
          <p className="font-body text-[#F5F0E8]/80 text-lg">
            {VARIETIES.length} varieties growing in the red dirt right now. Sign up to be the first to know when they're ready to cut.
          </p>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg border border-[#B5451B]/10 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Filter size={15} className="text-[#B5451B]" />
                <span className="font-heading text-[#2A1F1A] font-semibold text-sm">Filter Varieties</span>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Column */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded border font-body text-sm font-medium bg-white border-[#B5451B]/20 text-[#2A1F1A]/70"
              >
                <SlidersHorizontal size={14} />
                Filters
                {hasFilters && <span className="bg-[#B5451B] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">!</span>}
              </button>

              {/* Active filter chips */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {activeCategory !== "All" && (
                  <span className="inline-flex items-center gap-1 font-body text-xs font-semibold px-2 py-0.5 rounded-full bg-[#B5451B] text-white">
                    {activeCategory}
                    <button onClick={() => setActiveCategory("All")}><X size={10} /></button>
                  </span>
                )}
                {stageFilter !== "All" && (
                  <span className="inline-flex items-center gap-1 font-body text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2A1F1A] text-white">
                    {stageFilter}
                    <button onClick={() => setStageFilter("All")}><X size={10} /></button>
                  </span>
                )}
                {Array.from(activeTags).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 font-body text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7A8C6E] text-white">
                    {tag}
                    <button onClick={() => toggleTag(tag)}><X size={10} /></button>
                  </span>
                ))}
              </div>

              {/* Sort + count */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="font-body text-xs text-[#2A1F1A]/40">{filtered.length} of {VARIETIES.length}</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none font-body text-xs font-semibold pl-7 pr-6 py-1.5 rounded border border-[#B5451B]/20 bg-white text-[#2A1F1A]/70 focus:outline-none focus:border-[#B5451B] cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ArrowUpDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#2A1F1A]/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mobile filter panel */}
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white rounded-lg border border-[#B5451B]/10 p-5 mb-6">
                <FilterSidebar />
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Flower2 className="w-10 h-10 text-[#B5451B]/20 mx-auto mb-3" />
                <p className="font-heading text-[#2A1F1A]/40 font-semibold">No varieties match your filters.</p>
                <button onClick={clearAll} className="mt-3 font-body text-sm text-[#B5451B] hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((v) => {
                  const isExpanded = expandedCard === v.name;
                  const catColor = CATEGORY_COLORS[v.category] || v.color;
                  return (
                    <div
                      key={v.name}
                      className="bg-white rounded-lg border border-[#B5451B]/10 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                      style={{ borderLeftColor: catColor, borderLeftWidth: "3px" }}
                    >
                      {/* Photo */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {v.img
                          ? <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                          : <PhotoPlaceholder color={catColor} />
                        }
                        {/* Stage badge */}
                        <div className="absolute top-2 left-2 font-body text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
                          style={{ background: catColor }}>
                          {v.stageLabel}
                        </div>
                        {/* Category badge */}
                        <div className="absolute top-2 right-2 font-body text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#2A1F1A]/70 text-[#F5F0E8]">
                          {v.category}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        {/* Name + Latin */}
                        <h3 className="font-heading text-[#2A1F1A] font-semibold text-base leading-tight">{v.name}</h3>
                        <p className="font-body text-[#2A1F1A]/35 text-[11px] italic mb-2">{v.latin}</p>

                        {/* Tags — clickable */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {v.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`font-body text-[10px] font-semibold px-1.5 py-0.5 rounded border transition-colors ${
                                activeTags.has(tag)
                                  ? "bg-[#2A1F1A] text-white border-[#2A1F1A]"
                                  : "bg-[#F5F0E8] text-[#2A1F1A]/50 border-[#B5451B]/10 hover:border-[#B5451B]/40"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* Description */}
                        <p className="font-body text-[#2A1F1A]/60 text-xs leading-relaxed mb-3">{v.desc}</p>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 p-2.5 bg-[#F5F0E8] rounded">
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Vase Life</p>
                            <p className="font-body text-xs font-semibold text-[#2A1F1A]/70">{v.vaseLife}</p>
                          </div>
                          <div>
                            <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Stem Length</p>
                            <p className="font-body text-xs font-semibold text-[#2A1F1A]/70">{v.stemLength}</p>
                          </div>
                          {v.fragrance !== "None" && (
                            <div className="col-span-2">
                              <p className="font-body text-[9px] uppercase tracking-wide text-[#2A1F1A]/30">Fragrance</p>
                              <p className="font-body text-xs font-semibold text-[#7A8C6E]">{v.fragrance}</p>
                            </div>
                          )}
                        </div>

                        {/* Florist details toggle */}
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : v.name)}
                          className="flex items-center gap-1 text-left text-xs font-semibold mb-2 transition-colors"
                          style={{ color: catColor }}
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          Florist details
                        </button>

                        {isExpanded && (
                          <div className="text-xs space-y-1.5 mb-3 border-t border-[#B5451B]/10 pt-2.5">
                            <div><span className="font-semibold text-[#2A1F1A]/50">Design Use: </span><span className="text-[#2A1F1A]/70">{v.designUse}</span></div>
                            <div><span className="font-semibold text-[#2A1F1A]/50">Care Tip: </span><span className="text-[#2A1F1A]/70">{v.careTip}</span></div>
                            <div><span className="font-semibold text-[#2A1F1A]/50">Season: </span><span className="text-[#2A1F1A]/70">{v.season}</span></div>
                          </div>
                        )}

                        {/* Progress bar */}
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-body text-[9px] text-[#2A1F1A]/40 uppercase tracking-wide">Growth Progress</span>
                            <span className="font-body text-[9px] font-semibold" style={{ color: catColor }}>{v.stage}%</span>
                          </div>
                          <BloomBar pct={v.stage} color={catColor} />
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock size={10} className="text-[#2A1F1A]/30" />
                            <span className="font-body text-[10px] text-[#2A1F1A]/40">{v.eta}</span>
                          </div>
                        </div>

                        {/* Notify button */}
                        <button
                          onClick={() => handleNotify(v.name)}
                          disabled={notified.has(v.name)}
                          className={`mt-3 w-full font-body text-xs font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1.5 ${
                            notified.has(v.name)
                              ? "bg-[#7A8C6E]/15 text-[#7A8C6E] cursor-default"
                              : "text-white"
                          }`}
                          style={!notified.has(v.name) ? { background: catColor } : {}}
                        >
                          {notified.has(v.name) ? (
                            <><Sprout size={12} /> You're on the list</>
                          ) : (
                            <><Mail size={12} /> Wake Me When It Blooms</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Bloom Watch CTA */}
      <section className="py-16 bg-[#2A1F1A]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Flower2 className="w-8 h-8 text-[#E8A020] mx-auto mb-4" />
          <h2 className="font-heading text-[#F5F0E8] font-bold text-3xl mb-3">Get the Harvest Notification</h2>
          <p className="font-body text-[#F5F0E8]/60 mb-6">
            Be the first to know when any variety is ready to cut. One email, no spam.
          </p>
          <form onSubmit={handleGlobalSignup} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={globalEmail}
              onChange={(e) => setGlobalEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 font-body text-sm px-4 py-2.5 rounded bg-[#F5F0E8]/10 text-[#F5F0E8] placeholder-[#F5F0E8]/30 border border-[#F5F0E8]/10 focus:outline-none focus:border-[#E8A020]"
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="bg-[#E8A020] hover:bg-[#d4911a] text-[#2A1F1A] font-body font-semibold text-sm px-5 py-2.5 rounded transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {subscribeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              Notify Me
            </button>
          </form>
        </div>
      </section>

      {/* Wake Me Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2A1F1A]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#2A1F1A]/10 hover:bg-[#2A1F1A]/20 text-[#2A1F1A] transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#B5451B]/10 flex items-center justify-center">
                <Sprout size={16} className="text-[#B5451B]" />
              </div>
              <div>
                <h3 className="font-heading text-[#2A1F1A] font-semibold text-base">Wake Me When It Blooms</h3>
                <p className="font-body text-[#2A1F1A]/50 text-xs">{modalVariety}</p>
              </div>
            </div>
            <p className="font-body text-[#2A1F1A]/60 text-sm mb-4">
              Enter your email and we'll notify you the moment this variety is ready to cut.
            </p>
            <form onSubmit={handleModalSubmit} className="space-y-3">
              <input
                type="email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full font-body text-sm px-4 py-2.5 rounded border border-[#B5451B]/20 focus:outline-none focus:border-[#B5451B] bg-[#F5F0E8]/50"
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="w-full bg-[#B5451B] hover:bg-[#9a3a16] text-[#F5F0E8] font-body font-semibold text-sm py-2.5 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {subscribeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Notify Me When It's Ready
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
