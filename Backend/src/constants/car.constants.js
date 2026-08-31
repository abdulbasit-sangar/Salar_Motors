export const STEERING = {
  RHD: "RHD",
  LHD: "LHD",
};

export const FUEL_TYPE = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
  CNG: "CNG",
};

export const BODY_TYPE = {
  SEDAN: "Sedan",
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  COUPE: "Coupe",
  PICKUP: "Pickup",
  VAN: "Van",
  MINIVAN: "Minivan",
  WAGON: "Wagon",
  CONVERTIBLE: "Convertible",
};

export const TRANSMISSION = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual",
  CVT: "CVT",
};

export const CONDITION = {
  NEW: "New",
  USED: "Used",
  CERTIFIED: "Certified Pre-Owned",
};

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown option sources (Brand / Province / Year / Engine CC)
//
// Single source of truth for the four car dropdown fields. The frontend
// never hardcodes these — it fetches them from GET /api/cars/options
// (see car.controller.js / car.service.js), which reads directly from this
// file. Keep this file as the only place these lists are edited.
// ─────────────────────────────────────────────────────────────────────────────

// Plain arrays (not key/value maps like STEERING etc.) since these are
// open lists of display strings, not a small fixed enum with symbolic keys.
export const CAR_BRANDS = [
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Lexus",
  "Mazda",
  "Mitsubishi",
  "Subaru",
  "Suzuki",
];

export const PROVINCES = [
  "Kabul",
  "Nangarhar",
  "Herat",
  "Kandahar",
  "Balkh",
  "Kunduz",
  "Nimroz",
  "Helmand",
  "Ghazni",
  "Paktia",
  "Khost",
  "Logar",
  "Wardak",
  "Parwan",
  "Kapisa",
  "Laghman",
  "Kunar",
  "Paktika",
  "Zabul",
  "Uruzgan",
  "Farah",
  "Badghis",
  "Ghor",
  "Faryab",
  "Jowzjan",
  "Samangan",
  "Baghlan",
  "Takhar",
  "Badakhshan",
  "Bamyan",
  "Daikundi",
  "Panjshir",
  "Nuristan",
  "Sar-e Pol",
];

export const ENGINE_CC_OPTIONS = [
  660, 1000, 1200, 1300, 1500, 1600, 1800, 2000, 2400, 2500, 2700, 3000,
  3500, 4000, 4500, 5000, 6000,
];

// Kept in sync with the Car model's `year` bounds (models/car.model.js) and
// the Joi `year` field (validators/car.validator.js): min 2005, max is
// always "current year + 1". Years are generated here, never hand-maintained.
export const MIN_CAR_YEAR = 2005;

export const getMaxCarYear = () => new Date().getFullYear() + 1;

// Newest year first — matches how a buyer expects a year dropdown to read.
export const getCarYears = () => {
  const maxYear = getMaxCarYear();
  const years = [];
  for (let year = maxYear; year >= MIN_CAR_YEAR; year--) {
    years.push(year);
  }
  return years;
};
