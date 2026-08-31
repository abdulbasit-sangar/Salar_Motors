import { useEffect, useState } from "react";
import { HeroSearchBar } from "./HeroSearchBar.jsx";

/**
 * Hero background is now the fixed local asset `/images/pic2.jpg`
 * (no remote/hotlinked image). `heroCar` is kept as an accepted prop
 * purely for API compatibility with existing callers — it no longer
 * drives the background image.
 *
 * Two layouts, split at the `lg` breakpoint:
 *  - Mobile/tablet (< lg): natural-aspect image, no crop, text overlaps
 *    the bottom of the photo. Untouched from the previous version.
 *  - Laptop/desktop (>= lg): full viewport height, `bg-cover` background,
 *    text + search bar laid out within that fixed height — matches the
 *    original desktop composition.
 */
export const HeroSection = ({ heroCar }) => {
  // Drives the entrance choreography (staggered text/search bar reveal)
  // and the slow background ken-burns zoom.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-graphite-950">
      {/* ---------- Laptop / desktop (lg and up) ---------- */}
      <div className="hidden lg:flex lg:min-h-screen lg:flex-col relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] ease-out will-change-transform"
          style={{
            backgroundImage: "url(/Images/Pic2.jpg)",
            transform: mounted ? "scale(1.08)" : "scale(1)",
          }}
          aria-hidden="true"
        />
        <div
          className={
            "absolute inset-0 bg-gradient-to-b from-graphite-950/70 via-graphite-950/40 to-graphite-950/85 " +
            "transition-opacity duration-1000 ease-out " +
            (mounted ? "opacity-100" : "opacity-0")
          }
          aria-hidden="true"
        />

        <div className="container-page relative flex-1 flex flex-col justify-between py-14 lg:py-16">
          <div className="max-w-4xl pt-12 lg:pt-16">
            <p
              className={
                "font-mono text-xs uppercase tracking-[0.2em] text-brass-light mb-3 " +
                "transition-all duration-700 ease-out " +
                (mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4")
              }
            >
              Premium Imported Vehicles
            </p>
            <h1
              style={{ transitionDelay: mounted ? "100ms" : "0ms" }}
              className={
                "font-display text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight text-black " +
                "transition-all duration-700 ease-out " +
                (mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              Find Your
              <br />
              <span className="text-brass-dark">Next Drive.</span>
            </h1>
            <p
              style={{ transitionDelay: mounted ? "220ms" : "0ms" }}
              className={
                "text-lg xl:text-xl leading-relaxed mt-6 max-w-xl text-black " +
                "transition-all duration-700 ease-out " +
                (mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              Discover verified right-hand and left-hand drive imports from
              trusted sources. Search by brand, budget, and location all in one
              place.
            </p>
          </div>

          <div
            style={{ transitionDelay: mounted ? "340ms" : "0ms" }}
            className={
              "mt-12 w-full pb-8 transition-all duration-700 ease-out " +
              (mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6")
            }
          >
            <HeroSearchBar />
          </div>
        </div>
      </div>

      {/* ---------- Mobile / tablet (below lg) — unchanged ---------- */}
      <div className="lg:hidden flex flex-col">
        <div className="relative w-full overflow-hidden">
          <img
            src="/Images/Pic2.jpg"
            alt=""
            className={
              "block w-full h-auto transition-transform duration-[16000ms] ease-out will-change-transform " +
              (mounted ? "scale-110" : "scale-100")
            }
          />

          <div
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-graphite-950 via-graphite-950/70 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-graphite-950/50 to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="container-page relative z-10 -mt-28 sm:-mt-36 pb-10 sm:pb-14">
          <div className="max-w-4xl">
            <h1
              className={
                "font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-black " +
                "transition-all duration-700 ease-out " +
                (mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              Find Your
              <br />
              <span className="text-brass-dark">Next Drive.</span>
            </h1>
            <p
              style={{ transitionDelay: mounted ? "150ms" : "0ms" }}
              className={
                "text-base sm:text-lg leading-relaxed mt-6 max-w-xl text-black " +
                "transition-all duration-700 ease-out " +
                (mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              Discover verified right-hand and left-hand drive imports from
              trusted sources. Search by brand, budget, and location all in one
              place.
            </p>
          </div>

          <div
            style={{ transitionDelay: mounted ? "280ms" : "0ms" }}
            className={
              "mt-10 sm:mt-12 w-full transition-all duration-700 ease-out " +
              (mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6")
            }
          >
            <HeroSearchBar />
          </div>
        </div>
      </div>
    </section>
  );
};
