import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../store/auth/AuthContext.jsx";
import { SearchBar } from "../../shared/components/SearchBar.jsx";
import { useEscapeKey } from "../../shared/hooks/useEscapeKey.js";
import { SearchIcon, MenuIcon, CloseIcon } from "../../shared/components/icons.jsx";
import logo from "../../assets/salarmotors.svg";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/listings", label: "Browse" },
  { to: "/about", label: "About" },
  { to: "/listings/right-hand", label: "RHD" },
  { to: "/listings/left-hand", label: "LHD" },
];

const navLinkClass = ({ isActive }) =>
  clsx(
    "relative text-sm font-medium transition-colors py-1",
    isActive
      ? "text-brass-dark after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-brass"
      : "text-ash hover:text-bone",
  );

const mobileNavLinkClass = ({ isActive }) =>
  clsx(
    "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-all duration-200",
    isActive
      ? "bg-brass/10 text-brass-dark"
      : "text-bone hover:bg-graphite-100 active:scale-[0.98]",
  );

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEscapeKey(() => setOpen(false), open);
  useEscapeKey(() => setSearchOpen(false), searchOpen);

  useEffect(() => {
    if (!open && !searchOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setOpen(false);
    setKeyword("");
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-nav">
        <div className="container-page h-[76px] flex items-center gap-4">
          <NavLink
            to="/"
            className="flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <img
              src={logo}
              alt="Salar Motors logo"
              className="h-9 md:h-11 w-auto object-contain"
            />
          </NavLink>

          <nav className="hidden md:flex items-center justify-center gap-6 xl:gap-8 flex-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm">
            <SearchBar />
          </div>

          <button
            type="button"
            className="md:hidden ml-auto flex h-10 w-10 items-center justify-center rounded-full text-bone transition-colors hover:bg-graphite-100"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "fixed inset-0 z-40 bg-graphite/45 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <nav
        className={clsx(
          "fixed right-0 top-0 z-50 flex h-screen w-[84%] max-w-[360px] flex-col glass-panel-strong shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Mobile navigation"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-card px-4 py-4">
          <NavLink
            to="/"
            className="flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <img
              src={logo}
              alt="Salar Motors logo"
              className="h-8 w-auto object-contain"
            />
          </NavLink>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-bone transition-colors hover:bg-graphite-100"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mt-2 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={mobileNavLinkClass}
                onClick={() => setOpen(false)}
              >
                <span>{link.label}</span>
                <span className="text-ash">↗</span>
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className={clsx(mobileNavLinkClass({ isActive: false }), "mt-2 w-full")}
            onClick={() => {
              setOpen(false);
              setSearchOpen(true);
            }}
          >
            <span className="flex items-center gap-2.5">
              <SearchIcon className="h-4 w-4" />
              Search vehicles
            </span>
          </button>
        </div>
      </nav>

      <div
        className={clsx(
          "fixed inset-0 z-[60] flex items-center justify-center bg-graphite/55 px-4 backdrop-blur-sm transition-all duration-300 md:hidden",
          searchOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setSearchOpen(false)}
      >
        <div
          className={clsx(
            "w-full max-w-md rounded-3xl glass-panel-strong p-4 shadow-2xl transition-all duration-300",
            searchOpen
              ? "translate-y-0 scale-100"
              : "translate-y-4 scale-[0.98]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ash">
              Search
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-bone transition-colors hover:bg-graphite-100"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <label htmlFor="mobile-search" className="sr-only">
              Search cars
            </label>

            <input
              id="mobile-search"
              ref={searchInputRef}
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search brand, model, or province…"
              className="h-12 w-full rounded-2xl border border-card bg-white/80 px-4 text-sm text-bone outline-none transition focus:border-brass focus:ring-2 focus:ring-brass/20"
            />

            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-brass text-sm font-semibold text-graphite-950 transition hover:bg-brass-light"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};
