import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "All Listings" },
  { to: "/listings/right-hand", label: "RHD Cars" },
  { to: "/listings/left-hand", label: "LHD Cars" },
  { to: "/about", label: "About Us" },
];

const LEGAL_LINKS = [
  { to: "/about#privacy", label: "Privacy Policy" },
  { to: "/about#terms", label: "Terms & Conditions" },
];

export const Footer = () => (
  <footer className="border-t border-card bg-graphite-100/40">
    <div className="container-page py-14 sm:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {/* Brand */}
        <div className="lg:col-span-1">
          <span className="font-display text-2xl font-bold tracking-tight text-bone">
            Salar<span className="text-brass"> Motors</span>
          </span>
          <p className="text-ash text-sm mt-3 leading-relaxed max-w-xs">
            Premium imported vehicles marketplace. Verified RHD and LHD listings
            from trusted sources worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-bone mb-4">Quick Links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-ash hover:text-brass-dark transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-bone mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="tel:+93770957493"
                className="flex items-center gap-3 text-ash hover:text-brass-dark transition-colors"
              >
                <FaPhoneAlt className="text-brass shrink-0" aria-hidden="true" />
                <span>+93 (0) 770957493</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:salar.motors10@gmail.com"
                className="flex items-center gap-3 text-ash hover:text-brass-dark transition-colors"
              >
                <FaEnvelope className="text-brass shrink-0" aria-hidden="true" />
                <span>salar.motors10@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-semibold text-bone mb-4">Follow Us</h3>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/share/18yrLpJSkU/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-card bg-white/60 text-ash hover:text-brass-dark hover:border-brass/50 transition-all duration-200"
            >
              <FaFacebookF className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/93770957493"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-card bg-white/60 text-ash hover:text-brass-dark hover:border-brass/50 transition-all duration-200"
            >
              <FaWhatsapp className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-card bg-white/60 text-ash hover:text-brass-dark hover:border-brass/50 transition-all duration-200"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
          </div>

          <ul className="mt-6 space-y-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-ash hover:text-brass-dark transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="border-t border-card">
      <div className="container-page py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-ash">
        <p>© {new Date().getFullYear()} Salar Motors. All rights reserved.</p>
        <p>All listings subject to availability.</p>
      </div>
    </div>
  </footer>
);
