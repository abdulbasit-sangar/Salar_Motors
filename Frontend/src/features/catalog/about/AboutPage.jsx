import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEye,
  FaBolt,
  FaHeadset,
  FaCar,
  FaSearch,
  FaCommentDots,
  FaCheckCircle,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import { Button } from "../../../shared/components/Button.jsx";
import { Card } from "../../../shared/components/Card.jsx";

/* ---------------------------------------------------------------------- */
/* Scroll-reveal — lightweight, dependency-free (IntersectionObserver)    */
/* ---------------------------------------------------------------------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
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
}

/* ---------------------------------------------------------------------- */
/* Content                                                                 */
/* ---------------------------------------------------------------------- */
const WHY_CHOOSE_US = [
  {
    icon: FaShieldAlt,
    title: "Trusted vehicle listings",
    description:
      "Every listing is presented with clarity so buyers can make confident decisions.",
  },
  {
    icon: FaEye,
    title: "Quality and transparency",
    description:
      "We focus on honest details, clear information, and a straightforward experience from start to finish.",
  },
  {
    icon: FaBolt,
    title: "Easy buying process",
    description:
      "From browsing to inquiry, the flow is designed to save time and reduce friction.",
  },
  {
    icon: FaHeadset,
    title: "Customer support",
    description:
      "Our team is here to guide users through questions, availability, and next steps.",
  },
  {
    icon: FaCar,
    title: "Wide range of vehicles",
    description:
      "Browse a diverse mix of options to find a car that fits your needs and budget.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: FaSearch,
    title: "Browse available vehicles",
    description:
      "Explore the latest listings and narrow the selection by make, model, steering, and price.",
  },
  {
    icon: FaCheckCircle,
    title: "Select your preferred car",
    description:
      "Shortlist the vehicles that match your lifestyle, budget, and expectations.",
  },
  {
    icon: FaCommentDots,
    title: "Contact the seller or company",
    description:
      "Reach out directly to ask questions, confirm details, and arrange the next step.",
  },
  {
    icon: FaCar,
    title: "Complete the purchase process",
    description:
      "Move forward with confidence through a simple, guided path to ownership.",
  },
];

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */
export default function AboutPage() {
  return (
    <div className="bg-graphite-950">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-steel">
        <div className="absolute inset-0">
          <img
            src="/Images/Pic16.jpg"
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/80 via-graphite-950/70 to-graphite-950" />
        </div>

        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-3">
              About Us
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-bone max-w-3xl leading-[1.1]">
              Your trusted destination for discovering quality vehicles.
            </h1>
            <p className="text-ash text-lg leading-8 mt-6 max-w-2xl">
              AutoMarket is a modern vehicle marketplace designed to bring
              buyers and sellers together with trust, transparency, and
              convenience in mind. We make it easier to explore quality
              vehicles, compare options, and move confidently toward the right
              purchase.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Why Choose Us ---------------- */}
      <section className="border-b border-steel">
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-3">
                Why Choose Us
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-bone">
                A marketplace built around confidence and clarity.
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {WHY_CHOOSE_US.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 100}>
                  <Card
                    className="group p-6 sm:p-7 h-full transition-all duration-300 hover:-translate-y-1 hover:border-brass/60"
                    tag={false}
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brass/10 text-brass transition-colors duration-300 group-hover:bg-brass group-hover:text-graphite-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl text-bone mt-4">
                      {item.title}
                    </h3>
                    <p className="text-ash text-sm leading-7 mt-3">
                      {item.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- How It Works ---------------- */}
      <section id="how-it-works" className="border-b border-steel">
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-3">
                How It Works
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-bone">
                Four straightforward steps to your next vehicle.
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-12">
            {/* connecting line (desktop only) */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-steel lg:block"
              aria-hidden="true"
            />

            <div className="grid gap-8 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={index * 120}>
                    <div className="relative">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-brass bg-graphite-950 text-brass">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mt-4">
                        Step {index + 1}
                      </p>
                      <h3 className="font-display text-2xl text-bone mt-2">
                        {step.title}
                      </h3>
                      <p className="text-ash text-sm leading-7 mt-3">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Contact CTA ---------------- */}
      <section>
        <div className="container-page py-16 sm:py-20">
          <Reveal>
            <Card className="relative overflow-hidden p-8 sm:p-10" tag={false}>
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brass/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-3">
                  Contact Us
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-bone">
                  Ready to explore the listings or speak with our team?
                </h2>
                <p className="text-ash text-base sm:text-lg leading-8 mt-5">
                  Browse available vehicles today or reach out for guidance on
                  your next purchase.
                </p>
              </div>
              <div className="relative mt-8 flex flex-col sm:flex-row gap-3">
                <Button as={Link} to="/listings" variant="primary">
                  Explore Listings
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  as="a"
                  href="mailto:salar.motors10@gmail.com"
                  variant="secondary"
                >
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
