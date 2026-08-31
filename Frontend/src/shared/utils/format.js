/**
 * formatPrice — renders a car price as a compact currency string.
 * Backend stores price as a plain Number with no currency field, so we
 * format it as a generic thousands-separated figure rather than assuming
 * a currency symbol that may not match the deployment's market.
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return "—";
  return new Intl.NumberFormat("en-US").format(price);
};

export const formatMileage = (mileage) => {
  if (mileage === undefined || mileage === null) return null;
  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
};

export const formatYear = (year) => (year ? String(year) : "—");

/**
 * Returns the first image URL for a car, or null if it has none.
 * Car.images is [{ url, public_id }], per car.model.js.
 */
export const getPrimaryImage = (car) => car?.images?.[0]?.url || null;

export const carTitle = (car) =>
  car?.title || [car?.brand, car?.model, car?.year].filter(Boolean).join(" ");

export const carLocation = (car) => [car?.city, car?.province].filter(Boolean).join(", ");

export const formatDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(
      new Date(dateValue)
    );
  } catch {
    return null;
  }
};
