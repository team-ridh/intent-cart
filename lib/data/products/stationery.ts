import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  camlinPencil:  CDN("71T3pNFX2vL"),   // Camlin HB Pencils
  natraj:        CDN("71LNGhH+uXL"),   // Natraj HB Pencils
  classmateNB:   CDN("81yScFk1LzL"),   // Classmate Notebook A4
  longBookNB:    CDN("71SKMjH0WRL"),   // Classmate Long Book
  camlinColour:  CDN("61qNanBP9bXL"),  // Camlin Colour Pencils 12s
  apsaraColour:  CDN("71vQHiWqiL"),    // Apsara Colour Pencils
  fevicol:       CDN("71EHjHq6xGL"),   // Fevicol SH Adhesive
  classmateScis: CDN("81I6xEYFpjL"),   // Classmate Scissors
  drawingSheet:  CDN("71UTK6VPiTL"),   // Drawing Sheets ITC
  ruler:         CDN("71I4Y0KNABL"),   // Camlin Ruler 30cm
  camlinCrayon:  CDN("71OCrKFmEZL"),   // Camlin Crayons 24s
  markerSet:     CDN("71VqPHiVqjL"),   // Sketch Pens
  whitener:      CDN("71qMdn9PbXL"),   // Camel Whitener
};

function sub(
  id: string, name: string, brand: string,
  price: number, mrp: number,
  type: Substitute["type"], label: string, reason: string,
  eta: number, image: string,
  asin?: string, rating?: number, reviewCount?: number
): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(
  id: string, name: string, brand: string, category: string,
  price: number, mrp: number,
  qty: number, unit: string, image: string,
  asin: string, rating: number, reviewCount: number,
  badge: string, description: string,
  reason: string, reasonTag: string, eta: number,
  substitutes: Substitute[],
  isEssential = true, isAddon = false
): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return {
    id, name, brand, category, price, mrp, discount, quantity: qty, unit,
    image, asin, rating, reviewCount, badge, description,
    reason, reasonTag, eta, substitutes, isEssential, isAddon,
  };
}

// ─── Stationery & School Supplies ─────────────────────────────────

export const CAMLIN_HB_PENCILS = item(
  "sta_001", "Camlin Neon HB Pencils", "Kokuyo Camlin",
  "Office & Stationery Supplies",
  45, 50, 1, "pack of 10",
  IMG.camlinPencil,
  "B07WDHKP7L", 4.4, 34521,
  "Amazon's Choice",
  "Premium HB graphite pencils with hexagonal barrel — smooth writing, easy erasing",
  "Standard requirement for school project work", "Project essential", 12,
  [
    sub("sta_001_s1", "Natraj HB Pencils", "Hindustan Pencils",
      25, 30, "cheapest", "Best Value", "₹20 cheaper, trusted school brand",
      10, IMG.natraj, "B07PQV4T7L", 4.3, 45231),
  ]
);

export const CLASSMATE_NOTEBOOK_A4 = item(
  "sta_002", "Classmate Pulse Spiral Notebook A4", "ITC Limited",
  "Office & Stationery Supplies",
  49, 55, 2, "200 pages each",
  IMG.classmateNB,
  "B07XKHQM5P", 4.4, 56782,
  "Best Seller",
  "180 GSM smooth white paper, spiral bound — ideal for project writing and drawing",
  "Drawing and writing pages for project", "Project base", 12,
  [
    sub("sta_002_s1", "Classmate Long Book Unruled", "ITC Limited",
      32, 38, "cheapest", "Best Value", "₹17 cheaper per book, same smooth paper",
      10, IMG.longBookNB, "B07WDK5H8R", 4.3, 34521),
  ]
);

export const CAMLIN_COLOUR_PENCILS = item(
  "sta_003", "Camlin Colour Pencils", "Kokuyo Camlin",
  "Art & Craft Supplies",
  89, 99, 1, "set of 12",
  IMG.camlinColour,
  "B07XKHQT4P", 4.5, 45231,
  "Amazon's Choice",
  "Vibrant, break-resistant colour pencils with smooth laydown — AP certified non-toxic",
  "Colouring and illustration for project", "Illustration", 12,
  [
    sub("sta_003_s1", "Apsara Colour Pencils", "Hindustan Pencils",
      72, 82, "cheapest", "Best Value", "₹17 cheaper, excellent colour richness",
      12, IMG.apsaraColour, "B07PQV6T4L", 4.3, 34521),
  ]
);

export const FEVICOL_ADHESIVE = item(
  "sta_004", "Fevicol SH Synthetic Resin Adhesive", "Pidilite Industries",
  "Adhesives & Tapes",
  28, 32, 1, "75 g",
  IMG.fevicol,
  "B07WDKH4TR", 4.6, 89234,
  "Best Seller",
  "India's most trusted white adhesive — strong bond for paper, cardboard & craft",
  "Adhesive for cutting and pasting project work", "Project adhesive", 12,
  []
);

export const CLASSMATE_SCISSORS = item(
  "sta_005", "Classmate Stainless Steel Scissors", "ITC Limited",
  "Art & Craft Supplies",
  49, 55, 1, "piece",
  IMG.classmateScis,
  "B07XKHQE6P", 4.3, 18923,
  "",
  "Stainless steel blades with comfortable moulded grip — child-safe rounded tip",
  "Cutting tool for craft and project work", "Craft tool", 14,
  [
    sub("sta_005_s1", "Faber-Castell Comfort Grip Scissors", "Faber-Castell",
      65, 75, "trusted", "Most Trusted", "Premium ergonomic grip, sharper stainless steel blades",
      14, IMG.classmateScis, "B07WDHKQ3L", 4.6, 22345),
    sub("sta_005_s2", "Camlin Craft Scissors", "Kokuyo Camlin",
      35, 40, "cheapest", "Best Value", "₹14 cheaper, same child-safe design",
      12, IMG.classmateScis, "B07PQV5T4L", 4.2, 12456),
  ]
);

export const DRAWING_SHEETS_ITC = item(
  "sta_006", "ITC Classmate Drawing Sheets A3", "ITC Limited",
  "Office & Stationery Supplies",
  22, 25, 5, "sheets",
  IMG.drawingSheet,
  "B07WDHKQ4L", 4.3, 12345,
  "",
  "200 GSM thick cartridge paper — bright white, perfect for poster & project display",
  "Extra display sheets for project presentation", "Display sheets", 12,
  [
    sub("sta_006_s1", "Maplitho A3 Drawing Paper Sheets", "Maplitho",
      15, 18, "cheapest", "Best Value", "₹7 cheaper for 5 sheets, same 150 GSM thickness",
      12, IMG.drawingSheet, "B07PQV5T3L", 4.1, 6234),
  ]
);

export const CAMLIN_RULER = item(
  "sta_007", "Camlin Transparent Ruler", "Kokuyo Camlin",
  "Office & Stationery Supplies",
  18, 20, 1, "30 cm",
  IMG.ruler,
  "B07XKHQM3P", 4.3, 9823,
  "",
  "Shatter-resistant transparent acrylic ruler with mm markings — edge-gripped design",
  "Measurement and straight line tool", "Measurement tool", 12,
  [], false, true
);
