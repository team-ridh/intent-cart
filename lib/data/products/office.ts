import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  jkCopier:         CDN("71g+I7lZA4L"),  // JK Copier A4 75gsm Paper 500 sheets
  classmateSpiralA4: CDN("81bXvM-uCML"), // Classmate Spiral Notebook A4 180 pages
  pilotV7:          CDN("41n5ZCWJ-zL"),  // Pilot V7 Hi-Techpoint Pen Blue
  faberPen:         CDN("81IPdljBXJL"),  // Faber-Castell Grip Ballpoint Pen 10-pack
  postIt:           CDN("71tO4H-FODL"),  // Post-it Super Sticky Notes 90s × 3 pads
  scotchTape:       CDN("813FyK8KsQL"),   // Scotch Magic Tape 19mm × 33m
  whiteboardMarker: CDN("71bfBxdDZmL"),  // Expo Whiteboard Markers 4-pack
  stapler:          CDN("71iCnP9BZNML"), // Kangaro DS-45N Stapler + 1000 pins
  hp680Ink:         CDN("61NLVeOt9BL"),  // HP 680 Black Ink Cartridge
  highlighters:     CDN("71lI5i7oDnL"),  // Camlin Sticky Highlighter 5-pack
  scissors:         CDN("51ez6qHBe7L"),  // Classmate 7-inch Scissors
  cello:            CDN("41n5ZCWJ-zL"),  // Cello Butterflow Ballpoint Pen 10-pack
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Office Supplies ──────────────────────────────────────────────

export const JK_COPIER_A4 = item(
  "offc_001", "JK Copier A4 Paper (75 GSM)", "JK Paper",
  "Printer Paper", 349, 399, 1, "500 sheets",
  IMG.jkCopier, "B07WDHKN4O", 4.5, 289234,
  "Best Seller",
  "India's #1 selling copier paper — 75 GSM, bright white, jam-free, works with all laser and inkjet printers",
  "Reliable A4 paper for printing and writing", "Office essential", 22,
  [
    sub("offc_001_s1", "JK Easy Copier A4 70 GSM 500 sheets", "JK Paper",
      299, 349, "cheapest", "Best Value", "₹50 cheaper, 70 GSM — good for everyday document printing",
      20, IMG.jkCopier, "B07XKHQM4O", 4.3, 189234),
    sub("offc_001_s2", "Double A A4 Paper 80 GSM 500 sheets", "Double A Thailand",
      399, 449, "trusted", "Most Trusted", "Premium 80 GSM — thicker, excellent for double-sided printing",
      22, IMG.jkCopier, "B07WDK5H4O", 4.6, 145678),
  ]
);

export const PILOT_V7_PEN = item(
  "offc_002", "Pilot V7 Hi-Techpoint Ball Pen (Pack of 5)", "Pilot Pen India",
  "Pens & Writing Instruments", 175, 200, 1, "5 blue pens",
  IMG.pilotV7, "B07WDHKQ4O", 4.6, 234567,
  "Best Seller",
  "Smooth, consistent ink flow — liquid ink ball pen with visible ink level, 0.7mm tip, classic office pen",
  "Premium liquid ink pen for smooth everyday writing", "Pen essential", 16,
  [
    sub("offc_002_s1", "Cello Butterflow Ballpoint Pen 10-pack Blue", "Cello Pens",
      69, 80, "cheapest", "Best Value", "₹106 cheaper, smooth ballpoint — everyday office and home use",
      14, IMG.cello, "B07XKHQE4O", 4.3, 289234),
    sub("offc_002_s2", "Faber-Castell Grip Ballpoint Pen 10-pack", "Faber-Castell India",
      125, 149, "trusted", "Most Trusted", "Anti-roll grip pen with smooth ballpoint ink — ergonomic design",
      16, IMG.faberPen, "B07PQV5T4O", 4.4, 145678),
  ]
);

export const POSTIT_NOTES = item(
  "offc_003", "Post-it Super Sticky Notes (3 Pads)", "3M India",
  "Sticky Notes & Notepads", 349, 399, 1, "3 pads × 90 sheets = 270 sheets",
  IMG.postIt, "B07WDHKP4O", 4.5, 178234,
  "Best Seller",
  "2x stronger adhesive — stick firmly, remove cleanly without tearing. Bright assorted colours for easy task management",
  "Strong sticky notes for task lists and reminders", "Sticky notes", 16,
  [
    sub("offc_003_s1", "Classmate Sticky Notes 5 colours × 50 sheets", "ITC Classmate",
      99, 119, "cheapest", "Best Value", "₹250 cheaper, basic self-adhesive note pads",
      14, IMG.classmateSpiralA4, "B07XKHQM4O", 4.2, 89234),
    sub("offc_003_s2", "Post-it Original Notes 100 sheets (Yellow)", "3M India",
      199, 229, "trusted", "Most Trusted", "Classic yellow Post-it — original formula, reliable adhesive",
      14, IMG.postIt, "B07WDK5H5O", 4.5, 145678),
  ]
);

export const CLASSMATE_SPIRAL_NOTEBOOK = item(
  "offc_004", "Classmate Spiral Notebook A4 — 180 Pages", "ITC Classmate",
  "Notebooks & Journals", 75, 89, 1, "A4, 180 pages, ruled",
  IMG.classmateSpiralA4, "B07WDHKN5O", 4.4, 145678,
  "Amazon's Choice",
  "Smooth ruled 75 GSM paper, perforated sheets for easy tear-out, strong spiral binding — India's most trusted notebook brand",
  "Everyday A4 notebook for office note-taking", "Notebook essential", 14,
  [
    sub("offc_004_s1", "Navneet Youva A4 Notebook 172 pages", "Navneet Education",
      65, 75, "cheapest", "Best Value", "₹10 cheaper, equally popular spiral A4 notebook",
      12, IMG.classmateSpiralA4, "B07XKHQE5O", 4.3, 89234),
    sub("offc_004_s2", "Oxford Spiral Notebook A4 160 pages", "Hameedia",
      89, 105, "trusted", "Most Trusted", "Higher quality paper, microperforated removable sheets",
      14, IMG.classmateSpiralA4, "B07WDK5H6O", 4.4, 67890),
  ]
);

export const SCOTCH_MAGIC_TAPE = item(
  "offc_005", "Scotch Magic Tape", "3M India",
  "Tape & Adhesives", 249, 289, 1, "19mm × 33m (2 rolls)",
  IMG.scotchTape, "B07WDHKP5O", 4.5, 189234,
  "Best Seller",
  "The original invisible tape — matte finish, writable surface, acid-free. Doesn't yellow over time. Office staple since 1930",
  "Invisible magic tape for documents and gifting", "Tape essential", 14,
  [
    sub("offc_005_s1", "Scotch Transparent Tape 18mm × 25m (2 rolls)", "3M India",
      149, 175, "cheapest", "Best Value", "₹100 cheaper, clear transparent tape for everyday use",
      12, IMG.scotchTape, "B07XKHQM5O", 4.4, 145678),
    sub("offc_005_s2", "Fevistik All-Purpose Glue Stick 12g × 3", "Pidilite",
      75, 89, "trusted", "Most Trusted", "Strong glue stick for paper, card and light craft work",
      12, IMG.scotchTape, "B07PQV5T5O", 4.3, 112345),
  ]
);

export const WHITEBOARD_MARKERS = item(
  "offc_006", "Expo Dry-Erase Whiteboard Markers (4-pack)", "Newell Brands India",
  "Markers & Highlighters", 149, 179, 1, "4 colours (black, blue, red, green)",
  IMG.whiteboardMarker, "B07WDHKQ5O", 4.4, 112345,
  "Amazon's Choice",
  "Low-odour dry-erase markers with chisel tip — intense colour, easy to erase, works on all whiteboard surfaces",
  "Dry-erase markers for whiteboard and office meetings", "Whiteboard marker", 14,
  [
    sub("offc_006_s1", "Camlin Whiteboard Marker 4-pack", "Kokuyo Camlin",
      99, 119, "cheapest", "Best Value", "₹50 cheaper, vibrant colours, easy to clean off whiteboards",
      12, IMG.whiteboardMarker, "B07XKHQE6O", 4.2, 89234),
    sub("offc_006_s2", "Stabilo Write-4-All Permanent Marker 4-pack", "Stabilo India",
      169, 199, "trusted", "Most Trusted", "Permanent markers for CD, glass, plastic and metal surfaces",
      14, IMG.whiteboardMarker, "B07WDK5H7O", 4.4, 67890),
  ]
);

export const KANGARO_STAPLER = item(
  "offc_007", "Kangaro Stapler DS-45N with 1000 Staple Pins", "Kangaro Industries",
  "Stapler & Punch", 199, 229, 1, "stapler + 1000 No.10 pins",
  IMG.stapler, "B07WDKH4TO", 4.4, 145678,
  "Best Seller",
  "India's most trusted stapler brand — full-strip stapler with flat and saddle clinch modes. Includes 1000 No.10 staples",
  "Reliable office stapler for everyday document binding", "Stapler", 16,
  [
    sub("offc_007_s1", "Kangaro HD-10L Stapler Heavy Duty 5000 pins", "Kangaro Industries",
      299, 349, "trusted", "Most Trusted", "Heavy-duty model, staples up to 20 sheets, more durable",
      16, IMG.stapler, "B07XKHQM6O", 4.5, 89234),
    sub("offc_007_s2", "Faber-Castell Mini Stapler + 500 pins", "Faber-Castell India",
      149, 175, "cheapest", "Best Value", "₹50 cheaper, compact mini stapler — good for light use",
      14, IMG.stapler, "B07PQV5T3O", 4.2, 67890),
  ]
);

export const HP_680_INK = item(
  "offc_008", "HP 680 Black Ink Advantage Cartridge", "HP India",
  "Printer Ink & Toner", 499, 579, 1, "single black cartridge (~480 pages)",
  IMG.hp680Ink, "B07WDHKP6O", 4.3, 89234,
  "Amazon's Choice",
  "Original HP 680 Black ink — for HP DeskJet 1115, 2135, 3635, 3835 series. Delivers crisp, professional black text",
  "Original HP black ink cartridge for home office printing", "Printer ink", 20,
  [
    sub("offc_008_s1", "HP 680 Tri-Color Ink Cartridge", "HP India",
      549, 629, "trusted", "Most Trusted", "Colour cartridge — cyan, magenta, yellow for photos and documents",
      20, IMG.hp680Ink, "B07XKHQE7O", 4.3, 67890),
    sub("offc_008_s2", "HP 802 Black Ink Advantage Cartridge", "HP India",
      449, 519, "cheapest", "Best Value", "₹50 cheaper, HP 802 for DeskJet 1000/1010/1510 series",
      18, IMG.hp680Ink, "B07PQV5T2O", 4.2, 78234),
  ]
);

export const CAMLIN_HIGHLIGHTERS = item(
  "offc_009", "Camlin Sticky Highlighter Markers (5-pack)", "Kokuyo Camlin",
  "Markers & Highlighters", 149, 175, 1, "5 neon colours",
  IMG.highlighters, "B07WDHKN6O", 4.3, 89234,
  "Amazon's Choice",
  "Fluorescent highlighting markers — yellow, green, pink, orange, blue. Chisel tip for broad or fine highlighting",
  "Neon highlighters for notes, books and documents", "Highlighter set", 14,
  [
    sub("offc_009_s1", "Stabilo Boss Original Highlighters 4-pack", "Stabilo India",
      199, 229, "trusted", "Most Trusted", "Germany's original highlighter — smooth, long-lasting ink",
      14, IMG.highlighters, "B07XKHQM7O", 4.5, 56789),
    sub("offc_009_s2", "Faber-Castell Textliner Highlighter 4-pack", "Faber-Castell India",
      129, 149, "cheapest", "Best Value", "₹20 cheaper, vibrant fluorescent colours, quick-dry ink",
      12, IMG.highlighters, "B07WDK5H8O", 4.3, 45678),
  ]
);

export const OFFICE_SCISSORS = item(
  "offc_010", "Classmate Multi-Purpose Scissors 7-inch", "ITC Classmate",
  "Scissors & Cutters", 79, 95, 1, "1 pair, stainless steel blades",
  IMG.scissors, "B07WDKH5TO", 4.3, 89234,
  "",
  "Sharp stainless steel blades with comfortable soft-grip handle — cuts paper, fabric, cardboard and tape cleanly",
  "Multi-purpose scissors for office and home use", "Office scissors", 14,
  [], false, true
);
