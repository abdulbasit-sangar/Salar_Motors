import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { useAsyncData } from "../../../shared/hooks/useAsyncData.js";
import {
  fetchFeaturedCars,
  fetchRightHandCars,
  fetchLeftHandCars,
} from "../../../services/cars/carsApi.js";
import { CarCard, CarCardGrid } from "../../../shared/components/CarCard.jsx";
import { CarSection } from "../../../shared/components/CarSection.jsx";
import { CarCardSkeleton } from "../../../shared/components/Skeleton.jsx";
import { EmptyState } from "../../../shared/components/EmptyState.jsx";
import { ErrorState } from "../../../shared/components/ErrorState.jsx";
import { Pagination } from "../../../shared/components/Pagination.jsx";
import { CarSilhouetteIcon } from "../../../shared/components/icons.jsx";

const LIMIT = 12;

// Lightweight scroll/mount reveal — same pattern used on Home, About, and
// Browse, so this page animates in consistently with the rest of the site.
// Above-the-fold content (this page's whole layout) reveals immediately on
// load since it's already within the viewport when observed.
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function SteeringListingsPage() {
  const { direction } = useParams();
  const steering = direction === "left-hand" ? "LHD" : "RHD";
  const fetchFn = steering === "LHD" ? fetchLeftHandCars : fetchRightHandCars;

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const sort = searchParams.get("sort") || "newest";

  const fetcher = useCallback(
    () =>
      Promise.all([
        fetchFn({ page, limit: LIMIT, sort }),
        fetchFeaturedCars(4),
      ]).then(([listings, featured]) => ({
        listings,
        featuredCars: (featured.cars || []).filter(
          (car) => car.steeringType === steering,
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steering, page, sort],
  );
  const { data, loading, error, refetch } = useAsyncData(fetcher, [
    steering,
    page,
    sort,
  ]);

  // useAsyncData keeps the previous result visible while a new fetch is in
  // flight — so on the very first load there's no `data` yet (show
  // skeletons), but switching between RHD and LHD already has the old
  // steering's cars on screen. For that case we dim/cross-fade the existing
  // content instead of yanking it out for a skeleton grid, so toggling
  // between RHD and LHD feels like a smooth in-place update rather than a
  // page reload.
  const isInitialLoad = loading && !data;
  const isSwitching = loading && !!data;

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params);
  };

  const handlePageChange = (nextPage) => {
    updateParams({ page: nextPage === 1 ? null : nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-page py-10 sm:py-14">
      {!error && data?.featuredCars?.length > 0 && (
        <Reveal
          className={clsx(
            "space-y-8 mb-10 transition-opacity duration-300 ease-out",
            isSwitching && "opacity-40",
          )}
        >
          <CarSection
            eyebrow="Handpicked"
            title="Sponsored"
            cars={data.featuredCars}
            loading={false}
            error={error}
            onRetry={refetch}
            emptyMessage={`No sponsored ${steering} listings are available right now.`}
          />
        </Reveal>
      )}

      <Reveal delay={120}>
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : isInitialLoad ? (
          <CarCardGrid>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </CarCardGrid>
        ) : (
          <div
            className={clsx(
              "transition-opacity duration-300 ease-out",
              isSwitching && "opacity-40 pointer-events-none",
            )}
          >
            {data?.listings?.cars?.length ? (
              <>
                <p className="text-ash text-sm mb-6">
                  {data.listings.pagination.totalCars} listing
                  {data.listings.pagination.totalCars === 1 ? "" : "s"}
                </p>
                <CarCardGrid>
                  {data.listings.cars.map((car) => (
                    <CarCard key={car._id} car={car} />
                  ))}
                </CarCardGrid>
                <div className="mt-10">
                  <Pagination
                    pagination={data.listings.pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CarSilhouetteIcon className="w-14 h-9" />}
                title={`No ${steering} listings yet`}
                description="Check back soon, or browse the full catalog instead."
              />
            )}
          </div>
        )}
      </Reveal>
    </div>
  );
}