import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardCheck,
  FaHeadset,
  FaShippingFast,
  FaShieldAlt,
} from "react-icons/fa";
import { HeroSection } from "./HeroSection.jsx";
import { CarSection } from "../../../shared/components/CarSection.jsx";
import { useAsyncData } from "../../../shared/hooks/useAsyncData.js";
import {
  fetchFeaturedCars,
  fetchCars,
  fetchRightHandCars,
  fetchLeftHandCars,
} from "../../../services/cars/carsApi.js";

const CATEGORIES = [
  {
    title: "Japanese Cars",
    description: "Toyota, Honda, Nissan & more",
    to: "/filter?brand=Toyota",
    emoji: "🇯🇵",
  },
  {
    title: "American Cars",
    description: "Ford, Chevy, Jeep & more",
    to: "/filter?brand=Ford",
    emoji: "🇺🇸",
  },
  {
    title: "Dubai Imports",
    description: "Premium UAE-sourced vehicles",
    to: "/filter?province=Dubai",
    emoji: "🇦🇪",
  },
  {
    title: "Luxury Cars",
    description: "High-end premium vehicles",
    to: "/filter?minPrice=25000",
    emoji: "✨",
  },
  {
    title: "SUVs",
    description: "Spacious family & adventure",
    to: "/filter?bodyType=SUV",
    emoji: "🚙",
  },
  {
    title: "Sedans",
    description: "Comfort, style & efficiency",
    to: "/filter?bodyType=Sedan",
    emoji: "🚗",
  },
];

const WHY_CHOOSE = [
  {
    title: "Verified Vehicles",
    description:
      "Every listing is screened and verified so you can browse with complete confidence.",
    icon: FaShieldAlt,
  },
  {
    title: "Quality Inspection",
    description:
      "Detailed condition reports and transparent specs help you make informed decisions.",
    icon: FaClipboardCheck,
  },
  {
    title: "Trusted Import Process",
    description:
      "From sourcing to delivery, our import process is built on reliability and trust.",
    icon: FaShippingFast,
  },
  {
    title: "Customer Support",
    description:
      "Our dedicated team guides you through every step of your car buying journey.",
    icon: FaHeadset,
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Browse",
    description:
      "Explore our curated catalog and filter by brand, price, year, and steering type.",
  },
  {
    step: 2,
    title: "Contact",
    description:
      "Reach out to our team or the seller directly to ask questions and confirm details.",
  },
  {
    step: 3,
    title: "Inspect",
    description:
      "Arrange a viewing or inspection to verify the vehicle meets your expectations.",
  },
  {
    step: 4,
    title: "Purchase",
    description:
      "Complete your purchase with confidence through our guided, transparent process.",
  },
];

const loadHomeData = async () => {
  const [featured, recent, rhd, lhd] = await Promise.all([
    fetchFeaturedCars(8),
    fetchCars({ page: 1, limit: 8, sort: "newest" }),
    fetchRightHandCars({ page: 1, limit: 1 }),
    fetchLeftHandCars({ page: 1, limit: 1 }),
  ]);

  return {
    featuredCars: featured.cars,
    recentCars: recent.cars,
    stats: {
      total: recent.pagination.totalCars,
      rhd: rhd.pagination.totalCars,
      lhd: lhd.pagination.totalCars,
      featured: featured.cars.length,
    },
  };
};

// Lightweight scroll-reveal hook — observes an element and flips `visible`
// to true the first time it enters the viewport, then disconnects.
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
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

const CategoryCard = ({ category, visible, delay }) => (
  <Link
    to={category.to}
    style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    className={
      "group card-light rounded-premium-lg p-6 sm:p-8 hover-lift shadow-card " +
      "transition-all duration-700 ease-out will-change-transform " +
      "hover:-translate-y-1.5 hover:shadow-card-hover active:scale-[0.98] " +
      (visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8")
    }
  >
    <span
      className="text-3xl mb-4 block transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3"
      aria-hidden="true"
    >
      {category.emoji}
    </span>
    <h3 className="font-display text-xl font-bold text-card group-hover:text-brass transition-colors duration-300">
      {category.title}
    </h3>
    <p className="text-card-muted text-sm mt-2 leading-relaxed">
      {category.description}
    </p>
  </Link>
);

const IconCard = ({ item, visible, delay }) => {
  const Icon = item.icon;
  return (
    <div
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={
        "group card-light rounded-premium-lg p-6 sm:p-8 hover-lift shadow-card text-center " +
        "transition-all duration-700 ease-out will-change-transform hover:-translate-y-1.5 " +
        (visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8")
      }
    >
      <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-brass/10 text-brass mb-5 transition-all duration-300 ease-out group-hover:bg-brass/20 group-hover:scale-110 group-hover:rotate-6">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold text-card">{item.title}</h3>
      <p className="text-card-muted text-sm mt-3 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
};

const StepCard = ({ step, title, description, isLast, visible, delay }) => (
  <div
    style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    className={
      "relative flex flex-col items-center text-center transition-all duration-700 ease-out " +
      (visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8")
    }
  >
    <div
      style={{ transitionDelay: visible ? `${delay + 150}ms` : "0ms" }}
      className={
        "w-12 h-12 flex items-center justify-center rounded-full bg-brass text-graphite-950 font-display font-bold text-lg mb-4 " +
        "transition-all duration-500 ease-out hover:scale-110 " +
        (visible ? "scale-100" : "scale-50")
      }
    >
      {step}
    </div>
    <h3 className="font-display text-lg font-bold text-bone">{title}</h3>
    <p className="text-ash text-sm mt-2 leading-relaxed max-w-[200px]">
      {description}
    </p>
    {!isLast && (
      <div
        className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] h-px bg-steel overflow-hidden"
        style={{ width: "calc(100% - 4rem)" }}
        aria-hidden="true"
      >
        <div
          style={{ transitionDelay: visible ? `${delay + 250}ms` : "0ms" }}
          className={
            "h-full bg-brass/60 transition-all duration-700 ease-out " +
            (visible ? "w-full" : "w-0")
          }
        />
      </div>
    )}
  </div>
);

export default function HomePage() {
  const { data, loading } = useAsyncData(loadHomeData, []);

  const [whyRef, whyVisible] = useReveal();
  const [howRef, howVisible] = useReveal();
  const [aboutRef, aboutVisible] = useReveal();

  return (
    <div>
      <HeroSection heroCar={data?.featuredCars?.[0]} />





      {/* Why Choose Salar Motors */}
      <section ref={whyRef} className="bg-section-light py-16 sm:py-24">
        <div className="container-page">
          <div
            className={
              "text-center max-w-2xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out " +
              (whyVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6")
            }
          >
            <p className="section-eyebrow">Why Salar Motors</p>
            <h2 className="section-title text-section-light">Why Choose Salar Motors</h2>
            <p className="section-subtitle text-section-light-muted mx-auto">
              We combine verified inventory, transparent pricing, and dedicated
              support to make importing your next car effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {WHY_CHOOSE.map((item, index) => (
              <IconCard
                key={item.title}
                item={item}
                visible={whyVisible}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howRef} className="bg-graphite-950 py-16 sm:py-24">
        <div className="container-page">
          <div
            className={
              "text-center max-w-2xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out " +
              (howVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6")
            }
          >
            <p className="section-eyebrow">Simple Process</p>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto">
              Four straightforward steps from browsing to ownership — no
              complexity, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {HOW_IT_WORKS.map((item, index) => (
              <StepCard
                key={item.title}
                step={item.step}
                title={item.title}
                description={item.description}
                isLast={index === HOW_IT_WORKS.length - 1}
                visible={howVisible}
                delay={index * 120}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="bg-section-light py-16 sm:py-24">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <p
              className={
                "section-eyebrow text-center transition-all duration-700 ease-out " +
                (aboutVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              About Us
            </p>
            <h2
              style={{ transitionDelay: aboutVisible ? "80ms" : "0ms" }}
              className={
                "section-title text-section-light text-center transition-all duration-700 ease-out " +
                (aboutVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6")
              }
            >
              Your Trusted Automotive Marketplace
            </h2>

            <div
              style={{ transitionDelay: aboutVisible ? "180ms" : "0ms" }}
              className={
                "card-light rounded-premium-lg shadow-card p-8 sm:p-12 mt-10 sm:mt-12 space-y-6 " +
                "transition-all duration-700 ease-out " +
                (aboutVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8")
              }
            >
              <p className="text-card text-base sm:text-lg leading-relaxed">
                Salar Motors is a premium vehicle marketplace specializing in
                imported right-hand and left-hand drive cars. We connect buyers
                with verified, quality vehicles sourced from Japan, America,
                Dubai, and beyond.
              </p>
              <p className="text-card-muted text-sm sm:text-base leading-relaxed">
                Our platform is designed with transparency at its core. Every
                listing includes detailed specifications, clear pricing, and
                location information so you can compare options and make
                confident decisions without leaving the catalog.
              </p>
              <p className="text-card-muted text-sm sm:text-base leading-relaxed">
                Whether you are looking for a reliable daily driver, a luxury
                import, or a family SUV, Salar Motors provides the tools and
                support to help you find exactly what you need.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="h-11 px-6 flex items-center bg-brass text-graphite-950 font-semibold text-sm rounded-lg transition-all duration-300 ease-out hover:bg-brass-light hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:scale-[0.97]"
                >
                  Learn More
                </Link>
                <Link
                  to="/listings"
                  className="h-11 px-6 flex items-center border border-card text-card font-semibold text-sm rounded-lg transition-all duration-300 ease-out hover:border-brass hover:text-brass hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                >
                  View All Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}