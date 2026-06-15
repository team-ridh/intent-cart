import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Mobile Accessories
  boatEarbuds:    CDN("71g+I0lZA4L"),   // boAt Airdopes 141
  oneplusNord:    CDN("81bXvM-uVLL"),   // OnePlus Nord Buds
  noiseBuds:      CDN("71DajhNIOOL"),   // Noise Buds VS104
  // Cables
  amkette:        CDN("71tO4H-FNVL"),   // Amkette USB-C Cable
  amazonBasicsC:  CDN("71VoH3oFGmL"),   // AmazonBasics USB-C Cable
  ankerCable:     CDN("71gy7r4e0XL"),   // Anker USB-C to C Cable
  microUsb:       CDN("71e6czReMTL"),   // Micro USB Cable
  // Chargers
  portronicsCharger: CDN("71bfBxdvZmL"), // Portronics Adapto 20W
  ambrane20w:     CDN("71iCnP9BZFL"),   // Ambrane 20W PD Charger
  ankerCharger:   CDN("71gy7r4e0XL"),   // Anker 20W USB-C Charger
  // Power Banks
  miPowerbank:    CDN("71URK6VPiTL"),   // Mi Power Bank 3i 20000mAh
  ambranePB:      CDN("71I3Y0KNABL"),   // Ambrane 20000mAh
  urbn10k:        CDN("71NBrKFmEZL"),   // URBN 10000mAh Slim
  // LED Lights / Smart Bulb
  syska:          CDN("71dY5xC7xCL"),   // Syska SSK-PAR20-W LED Bulb
  havellsLed:     CDN("71lI5i0oDnL"),   // Havells LED Bulb 9W
  philipsLed:     CDN("71y4cnjmFwL"),   // Philips LED Bulb 9W Base B22
  // Extension Boards
  anchExtension:  CDN("71XpbNhvMML"),   // Anchor Extension Cord
  havellsExt:     CDN("71dkNF0FX8L"),   // Havells 6-Socket Extension
  // Screen Protectors / Accessories
  spigen:         CDN("71dJkPQPHBL"),   // Spigen Tempered Glass
  // Laptop Accessories
  lapProtector:   CDN("71g5AEgbpAL"),   // Laptop Screen Protector
  usbHub:         CDN("81CSmAI5OkL"),   // AmazonBasics USB-A Hub
  mouseLogitech:  CDN("81MHpBXjijL"),   // Logitech M235 Wireless Mouse
  // IoT / Electronics components
  sdCard:         CDN("71X3VPXP-4L"),   // SanDisk 32GB Ultra MicroSD
  hdmi:           CDN("71PnGNE7FIL"),   // AmazonBasics HDMI Cable
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

// ─── Electronics & Tech Accessories ──────────────────────────────────

export const BOAT_AIRDOPES = item(
  "elec_001", "boAt Airdopes 141 TWS Earbuds", "Imagine Marketing (boAt)",
  "Audio & Headphones",
  1299, 2999, 1, "piece",
  IMG.boatEarbuds,
  "B09NXCG7H3", 4.1, 485231,
  "Best Seller",
  "42H playtime + IPX4 water-resistance + Instacharge (10min = 75min play)",
  "Wireless earbuds for music and calls", "Audio essential", 22,
  [
    sub("elec_001_s1", "OnePlus Nord Buds TWS", "OnePlus India",
      1799, 2999, "trusted", "Most Trusted", "12.4mm drivers + IP55 water-resistance + 27hr total playtime",
      22, IMG.oneplusNord, "B09XYZM7K3", 4.2, 123456),
    sub("elec_001_s2", "Noise Buds VS104 TWS Earbuds", "Nexxbase Marketing (Noise)",
      899, 1999, "cheapest", "Best Value", "₹400 cheaper, 24hr playtime, touch controls",
      20, IMG.noiseBuds, "B09ABK5XY1", 4.0, 234567),
  ]
);

export const USB_C_CABLE = item(
  "elec_002", "Ambrane USB-C Braided Cable 1.5m", "Ambrane India",
  "Mobile Accessories",
  349, 499, 2, "cables",
  IMG.amkette,
  "B07XKHQT9L", 4.3, 89234,
  "Amazon's Choice",
  "65W fast-charging support, nylon braided, 10,000 bend-test certified, 480 Mbps data sync",
  "Fast charging cable for Type-C devices", "Charging essential", 16,
  [
    sub("elec_002_s1", "AmazonBasics USB-C to USB-C Cable 1m", "Amazon Basics",
      299, 399, "trusted", "Most Trusted", "60W PD support, double-braided, certified",
      14, IMG.amazonBasicsC, "B07WDKH3TL", 4.4, 234567),
    sub("elec_002_s2", "Anker USB-C to USB-C Cable 1.8m", "Anker India",
      549, 699, "fastest", "Fastest", "100W power delivery, ultra-durable 10k bend lifespan",
      16, IMG.ankerCable, "B07PQV5T4L", 4.6, 145678),
  ]
);

export const USB_C_CHARGER_20W = item(
  "elec_003", "Portronics Adapto 20W USB-C PD Fast Charger", "Portronics India",
  "Mobile Accessories",
  699, 999, 1, "piece",
  IMG.portronicsCharger,
  "B09PXYZ123", 4.2, 67890,
  "Amazon's Choice",
  "20W USB Power Delivery — charges compatible phones 0-50% in 30 minutes",
  "Fast charger for Type-C smartphones and tablets", "Charging essential", 16,
  [
    sub("elec_003_s1", "Ambrane 20W PD Wall Charger", "Ambrane India",
      599, 899, "cheapest", "Best Value", "₹100 cheaper, dual port (USB-C + USB-A), 25W total",
      14, IMG.ambrane20w, "B09ABK5X2Z", 4.2, 45678),
    sub("elec_003_s2", "Anker Nano 20W USB-C Charger", "Anker India",
      1299, 1599, "trusted", "Most Trusted", "PowerIQ 3.0 technology, world's smallest 20W PD charger",
      16, IMG.ankerCharger, "B09PXYZ456", 4.5, 89234),
  ]
);

export const MI_POWERBANK_10K = item(
  "elec_004", "Xiaomi Redmi 10000mAh Power Bank", "Xiaomi India",
  "Mobile Accessories",
  999, 1299, 1, "piece",
  IMG.urbn10k,
  "B09PXYZ789", 4.3, 234567,
  "Best Seller",
  "10000mAh with 22.5W fast charging — dual output, charges most phones 2 times",
  "Portable power backup for devices", "Power backup", 18,
  [
    sub("elec_004_s1", "Mi Power Bank 3i 20000mAh", "Xiaomi India",
      1299, 1499, "trusted", "Most Trusted", "20000mAh, 18W fast charging, dual USB output",
      18, IMG.miPowerbank, "B07XKHQT3P", 4.4, 145231),
    sub("elec_004_s2", "Ambrane 10000mAh Power Bank", "Ambrane India",
      799, 1099, "cheapest", "Best Value", "₹200 cheaper, Made in India, compact design",
      16, IMG.ambranePB, "B09ABK5X3Y", 4.1, 89234),
  ]
);

export const PHILIPS_LED_BULB_9W = item(
  "elec_005", "Philips 9W LED Bulb Warm White B22", "Philips India",
  "Lighting",
  89, 99, 2, "bulbs",
  IMG.philipsLed,
  "B07WDHKN5P", 4.5, 189234,
  "Best Seller",
  "50,000 hours life, energy-saving 9W replaces 60W incandescent — instant full brightness",
  "Replacement LED bulb for home lighting", "Lighting essential", 14,
  [
    sub("elec_005_s1", "Havells Adore 9W LED Bulb B22 (2 pcs)", "Havells India",
      109, 120, "trusted", "Most Trusted", "Cool white 6500K, ISI mark, 3-year warranty",
      14, IMG.havellsLed, "B07XKHQM8L", 4.4, 134567),
    sub("elec_005_s2", "Syska 9W LED Bulb B22 (2 pcs)", "Syska LED Lights",
      79, 89, "cheapest", "Best Value", "₹10 cheaper, 2-year warranty, 800 lm output",
      12, IMG.syska, "B07PQV4T6P", 4.3, 89234),
  ]
);

export const AMAZON_BASICS_USB_HUB = item(
  "elec_006", "AmazonBasics USB-A 4-Port Hub", "Amazon Basics",
  "Computer Accessories",
  599, 699, 1, "piece",
  IMG.usbHub,
  "B00NH13RNY", 4.3, 145678,
  "Amazon's Choice",
  "4 USB 2.0 ports, 480 Mbps data transfer, plug-and-play — compatible with Windows and Mac",
  "Expand USB connectivity for laptop/PC", "Connectivity hub", 18,
  [
    sub("elec_006_s1", "Portronics Mport 5A USB Hub", "Portronics India",
      699, 899, "trusted", "Most Trusted", "5 ports USB 3.0 hub, aluminum body, faster data transfer",
      18, IMG.portronicsCharger, "B09PXYZ101", 4.2, 45678),
  ]
);

export const SANDISK_MICRO_SD_32GB = item(
  "elec_007", "SanDisk Ultra 32GB MicroSDHC Card", "Western Digital India",
  "Storage",
  399, 499, 1, "piece + SD adapter",
  IMG.sdCard,
  "B08KHMSP4X", 4.5, 345678,
  "Best Seller",
  "Up to 120MB/s read speed — Class 10, A1, ideal for Android phones, dashcams and drones",
  "Storage expansion for phones and devices", "Storage essential", 16,
  [
    sub("elec_007_s1", "Samsung 32GB MicroSDHC Card + Adapter", "Samsung India",
      449, 549, "trusted", "Most Trusted", "Up to 100MB/s, MB-MC32GA/IN, A2 performance class",
      16, IMG.sdCard, "B06XX29C7X", 4.5, 234567),
    sub("elec_007_s2", "Strontium Nitro 32GB microSD", "Strontium Technology",
      299, 399, "cheapest", "Best Value", "₹100 cheaper, Class 10 UHS-1, lifetime warranty",
      14, IMG.sdCard, "B09ABK5X4X", 4.1, 56789),
  ]
);

export const LOGITECH_MOUSE = item(
  "elec_008", "Logitech M235 Wireless Mouse", "Logitech India",
  "Computer Accessories",
  1295, 1595, 1, "piece",
  IMG.mouseLogitech,
  "B007Y9X3GE", 4.4, 234567,
  "Best Seller",
  "2.4 GHz wireless with nano receiver — smooth cursor control, 12-month battery life",
  "Wireless mouse for laptop/desktop work", "Productivity essential", 20,
  [
    sub("elec_008_s1", "HP X200 Wireless Optical Mouse", "HP India",
      849, 1099, "cheapest", "Best Value", "₹446 cheaper, 2.4GHz, 1600 DPI, plug-and-play",
      18, IMG.mouseLogitech, "B09PXYZ202", 4.1, 89234),
  ]
);

export const MICROUSB_CABLE = item(
  "elec_009", "Ambrane Braided Micro-USB Cable 1.5m", "Ambrane India",
  "Mobile Accessories",
  199, 299, 2, "cables",
  IMG.microUsb,
  "B09ABK5X5W", 4.2, 78234,
  "Amazon's Choice",
  "2.4A fast charging, nylon braided, 10,000 bend-test — compatible with older Android devices",
  "Charging cable for micro-USB devices", "Charging cable", 14,
  [
    sub("elec_009_s1", "AmazonBasics Micro-USB Cable 1m (2 pack)", "Amazon Basics",
      299, 399, "trusted", "Most Trusted", "Double-braided nylon, charging + sync, 2 year warranty",
      14, IMG.amazonBasicsC, "B00VQML76E", 4.3, 123456),
  ]
);

export const HDMI_CABLE = item(
  "elec_010", "AmazonBasics HDMI 4K High Speed Cable 1.8m", "Amazon Basics",
  "Audio / Video",
  499, 599, 1, "piece",
  IMG.hdmi,
  "B014I8SSD0", 4.4, 189234,
  "Best Seller",
  "4K@30Hz, Ethernet, 3D, ARC — gold-plated connectors, triple-shielded for clear signal",
  "Connect laptop, console or set-top box to TV", "HDMI cable", 18,
  [
    sub("elec_010_s1", "Portronics HDMI Cable 1.8m", "Portronics India",
      399, 499, "cheapest", "Best Value", "₹100 cheaper, 4K support, nylon braided jacket",
      16, IMG.hdmi, "B09PXYZ303", 4.2, 67890),
  ]
);

export const SCREEN_PROTECTOR = item(
  "elec_011", "Spigen Tempered Glass Screen Protector Universal", "Spigen India",
  "Mobile Accessories",
  299, 399, 2, "pieces",
  IMG.spigen,
  "B09PXYZ404", 4.3, 89234,
  "Amazon's Choice",
  "9H hardness, 0.3mm thin — precise laser-cut, self-align installation, scratch & shatter resistant",
  "Screen protection for smartphone", "Phone accessory", 16,
  [
    sub("elec_011_s1", "Gorilla Glass Tempered Protector (2 pack)", "JETech India",
      249, 349, "cheapest", "Best Value", "₹50 cheaper, bubble-free, 9H hardness",
      14, IMG.spigen, "B09ABK5X6V", 4.1, 67890),
  ]
);

export const ANCHOR_EXTENSION = item(
  "elec_012", "Anchor by Panasonic 6-Socket Extension Cord 2m", "Panasonic India",
  "Electrical",
  549, 649, 1, "piece",
  IMG.anchExtension,
  "B07WDKH3TP", 4.4, 178234,
  "Best Seller",
  "6 sockets + 2 USB ports, 2m wire, 6A rated, child-safety shutters, master switch",
  "Multi-device charging and power extension", "Electrical essential", 18,
  [
    sub("elec_012_s1", "Havells Reo 6A Extension Board 1.5m", "Havells India",
      499, 599, "trusted", "Most Trusted", "Heavy-duty PVC, ISI certified, 6 sockets + indicator LED",
      18, IMG.havellsExt, "B07PQV5T3P", 4.4, 123456),
    sub("elec_012_s2", "Portronics Power Plate 3S Extension 1.5m", "Portronics India",
      449, 549, "cheapest", "Best Value", "₹100 cheaper, 3 sockets + 3 USB, 2500W rated",
      16, IMG.anchExtension, "B09PXYZ505", 4.2, 89234),
  ]
);
