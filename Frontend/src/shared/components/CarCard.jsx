import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Badge } from "./Badge.jsx";
import { CarSilhouetteIcon, GaugeIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons.jsx";
import {
  carLocation,
  carTitle,
  formatMileage,
  formatPrice,
  formatYear,
  getPrimaryImage,
} from "../utils/format.js";
import { optimizedImageUrl, buildSrcSet } from "../utils/imagekit.js";

/**
 * Premium automotive product card. `premium` and `sponsored` are kept as
 * props for backward compatibility with existing call sites; `premium`
 * now only nudges spacing on larger layouts rather than switching themes.
 */
export const CarCard = ({ car, premium = false, sponsored = false }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageUrls = (car?.images || []).map((img) => img?.url).filter(Boolean);
  const image = imageUrls[activeImageIndex] || getPrimaryImage(car);
  const mileage = formatMileage(car.mileage);
  const location = carLocation(car);
  const year = formatYear(car.year);
  const showImageNavigation = imageUrls.length > 1;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [car?._id]);

  const handlePrevious = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((current) =>
      current === 0 ? imageUrls.length - 1 : current - 1,
    );
  };

  const handleNext = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((current) =>
      current === imageUrls.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <Link
      to={`/cars/${car._id}`}
      className={clsx(
        "group flex h-full flex-col overflow-hidden rounded-premium-lg bg-card border border-card",
        "shadow-card transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-card-hover hover:border-brass/40",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite-100">
        {image ? (
          <img
            src={optimizedImageUrl(image, { width: 480 })}
            srcSet={buildSrcSet(image)}
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
            alt={carTitle(car)}
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-steel">
            <CarSilhouetteIcon className="w-16 h-10" />
          </div>
        )}

        {/* subtle base gradient so badges/chips stay legible over any photo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-graphite/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {showImageNavigation && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="View previous image"
              className="absolute left-2 sm:left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full glass-panel text-graphite opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white/90 active:scale-95"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="View next image"
              className="absolute right-2 sm:right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full glass-panel text-graphite opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white/90 active:scale-95"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="absolute top-3 left-3 flex gap-1.5">
          {car.steeringType && <Badge variant="glass">{car.steeringType}</Badge>}
          {(sponsored || car.featured) && <Badge variant="brass">Featured</Badge>}
        </div>

        {year && year !== "—" && (
          <div className="absolute top-3 right-3">
            <Badge variant="glass" className="normal-case font-body tracking-normal">
              {year}
            </Badge>
          </div>
        )}
      </div>

      <div className={clsx("flex flex-1 flex-col p-5", premium && "sm:p-6")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-lg leading-snug text-card truncate">
            {carTitle(car)}
          </h3>
        </div>

        <p className="font-mono font-semibold text-brass-dark text-base mt-1.5">
          {formatPrice(car.price)}
        </p>

        {(location || mileage) && (
          <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
            {location && (
              <span className="chip-glass">
                <MapPinIcon className="w-3.5 h-3.5 text-ash" />
                {location}
              </span>
            )}
            {mileage && (
              <span className="chip-glass">
                <GaugeIcon className="w-3.5 h-3.5 text-ash" />
                {mileage}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export const CarCardGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
    {children}
  </div>
);
