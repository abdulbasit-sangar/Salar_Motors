import { apiClient } from "../api/client.js";
import { cached, cacheKey, invalidateCache } from "../api/cache.js";

// GET /api/cars/featured?limit=
export const fetchFeaturedCars = async (limit = 8) => {
  return cached(cacheKey("featured", { limit }), async () => {
    const { data } = await apiClient.get("/cars/featured", {
      params: { limit },
    });
    return data.data; // { cars }
  });
};

// GET /api/cars?page=&limit=&sort=
export const fetchCars = async (params = {}) => {
  return cached(cacheKey("cars", params), async () => {
    const { data } = await apiClient.get("/cars", { params });
    return data.data; // { cars, pagination }
  });
};

// GET /api/cars/admin?page=&limit=&sort=
export const fetchAdminCars = async (params = {}) => {
  return cached(cacheKey("cars-admin", params), async () => {
    const { data } = await apiClient.get("/cars/admin", { params });
    return data.data; // { cars, pagination }
  });
};

// GET /api/cars/right-hand
export const fetchRightHandCars = async (params = {}) => {
  return cached(cacheKey("right-hand", params), async () => {
    const { data } = await apiClient.get("/cars/right-hand", { params });
    return data.data;
  });
};

// GET /api/cars/left-hand
export const fetchLeftHandCars = async (params = {}) => {
  return cached(cacheKey("left-hand", params), async () => {
    const { data } = await apiClient.get("/cars/left-hand", { params });
    return data.data;
  });
};

// GET /api/cars/search?keyword= — short TTL since a person may edit a
// listing seconds after searching for it; still worth deduping bursts.
export const searchCars = async (params = {}) => {
  return cached(
    cacheKey("search", params),
    async () => {
      const { data } = await apiClient.get("/cars/search", { params });
      return data.data; // { cars, pagination, keyword }
    },
    15_000,
  );
};

// GET /api/cars/filter?...
export const filterCars = async (params = {}) => {
  return cached(
    cacheKey("filter", params),
    async () => {
      const { data } = await apiClient.get("/cars/filter", { params });
      return data.data; // { cars, pagination, appliedFilters }
    },
    15_000,
  );
};

// GET /api/cars/options — centralized dropdown options (brands, provinces,
// years, engineCC, steering, fuelTypes, bodyTypes, transmissions, conditions).
// Single source of truth is backend/constants/car.constants.js — components
// must not hardcode their own copies of these lists. Cached longer than the
// catalog data below since these change rarely (only when the constants
// file itself is edited on the backend).
export const fetchCarOptions = async () => {
  return cached(
    cacheKey("car-options", {}),
    async () => {
      const { data } = await apiClient.get("/cars/options");
      return data.data; // { brands, provinces, years, engineCC, steering, fuelTypes, bodyTypes, transmissions, conditions }
    },
    5 * 60_000,
  );
};

// GET /api/cars/similar/:id
export const fetchSimilarCars = async (id) => {
  return cached(cacheKey("similar", { id }), async () => {
    const { data } = await apiClient.get(`/cars/similar/${id}`);
    return data.data; // { cars, source }
  });
};

// GET /api/cars/:id — MUST be called after the named routes above;
// keep this last in the file as a reminder of backend route ordering.
export const fetchCarById = async (id) => {
  return cached(cacheKey("car", { id }), async () => {
    const { data } = await apiClient.get(`/cars/${id}`);
    return data.data.car;
  });
};

// POST /api/cars — protected, multipart/form-data (images field name: "images")
export const createCar = async (carFields, imageFiles = []) => {
  const formData = new FormData();
  Object.entries(carFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  imageFiles.forEach((file) => formData.append("images", file));

  const { data } = await apiClient.post("/cars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache(); // a new listing affects totals, featured lists, everything
  return data.data.car;
};

// PATCH /api/cars/feature/:id — protected
export const toggleFeatureCar = async (id) => {
  const { data } = await apiClient.patch(`/cars/feature/${id}`);
  invalidateCache();
  return data.data.car;
};

// PATCH /api/cars/hide/:id — protected
export const toggleHideCar = async (id) => {
  const { data } = await apiClient.patch(`/cars/hide/${id}`);
  invalidateCache();
  return data.data.car;
};

// DELETE /api/cars/:id — protected
export const deleteCar = async (id) => {
  const { data } = await apiClient.delete(`/cars/${id}`);
  invalidateCache();
  return data.message;
};

// Sort options are a pure frontend/UX concern (they map to SORT_MAP in the
// backend's car.service.js by value, not to a car.constants.js list), so
// they stay defined here rather than in GET /api/cars/options.
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "mileage_low", label: "Mileage: low to high" },
];
