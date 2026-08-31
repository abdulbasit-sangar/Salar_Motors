import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { PublicLayout } from "../layout/PublicLayout.jsx";
import { AdminLayout } from "../layout/AdminLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { GuestOnlyRoute } from "./GuestOnlyRoute.jsx";
import { SuperAdminOnlyRoute } from "./SuperAdminOnlyRoute.jsx";
import { RouteLoadingFallback } from "./RouteLoadingFallback.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

// Home and the Browse/Listings page are eager — they're the most common
// entry points and keeping them in the main bundle avoids a loading flash
// on first visit. FilterResultsPage is the one main filter used for
// Browse (/listings) — kept eager alongside it since it's what actually
// renders there now. SteeringListingsPage (RHD/LHD) is eager too: it's a
// single route (`/listings/:direction`) that switches steering type in
// place, so loading it lazily would re-trigger the Suspense fallback (a
// visible flash) every time someone toggles between RHD and LHD.
import HomePage from "../../features/catalog/home/HomePage.jsx";
import FilterResultsPage from "../../features/catalog/filters/FilterResultsPage.jsx";
import SteeringListingsPage from "../../features/catalog/listings/SteeringListingsPage.jsx";

// Everything else is route-split: search/details/admin are visited less
// often per-session than the catalog root, and the entire admin surface is
// irrelevant to the ~100% of visitors who aren't the site admin — no
// reason to ship that JS to every public visitor upfront.
const SearchResultsPage = lazy(
  () => import("../../features/catalog/search/SearchResultsPage.jsx"),
);
const CarDetailsPage = lazy(
  () => import("../../features/catalog/details/CarDetailsPage.jsx"),
);

const LoginPage = lazy(() => import("../../features/auth/login/LoginPage.jsx"));
const RegisterPage = lazy(
  () => import("../../features/auth/register/RegisterPage.jsx"),
);
const ManagerRegisterPage = lazy(
  () => import("../../features/auth/manager-register/ManagerRegisterPage.jsx"),
);
const ForgotPasswordPage = lazy(
  () => import("../../features/auth/forgot-password/ForgotPasswordPage.jsx"),
);
const ProfilePage = lazy(
  () => import("../../features/auth/profile/ProfilePage.jsx"),
);
const AboutPage = lazy(
  () => import("../../features/catalog/about/AboutPage.jsx"),
);

const DashboardPage = lazy(
  () => import("../../features/admin/dashboard/DashboardPage.jsx"),
);
const CreateListingPage = lazy(
  () => import("../../features/admin/create-listing/CreateListingPage.jsx"),
);
const ManageListingsPage = lazy(
  () => import("../../features/admin/manage-listings/ManageListingsPage.jsx"),
);
const ManagersPage = lazy(
  () => import("../../features/admin/managers/ManagersPage.jsx"),
);

const withSuspense = (Element) => (
  <Suspense fallback={<RouteLoadingFallback />}>{Element}</Suspense>
);

// Redirects /filter?<query> -> /listings?<query>, preserving whatever
// filter params were already in the URL (e.g. from the home page search).
const RedirectToListings = () => {
  const location = useLocation();
  return <Navigate to={`/listings${location.search}`} replace />;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* ── Public site ─────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={withSuspense(<AboutPage />)} />
        <Route path="/listings" element={<FilterResultsPage />} />
        {/* RHD and LHD are one route, not two — this is what lets clicking
            between them swap data in place instead of remounting the whole
            page (which is what caused the flash/flicker). */}
        <Route
          path="/listings/:direction"
          element={<SteeringListingsPage />}
        />
        <Route path="/search" element={withSuspense(<SearchResultsPage />)} />
        {/* Filter + Sort now live only inside Browse (/listings). /filter
            is kept as a redirect so any old links/bookmarks still land
            somewhere useful, carrying their query params along. */}
        <Route path="/filter" element={<RedirectToListings />} />
        <Route path="/cars/:id" element={withSuspense(<CarDetailsPage />)} />

        {/* Admin auth screens live under the public layout — no sidebar yet */}
        <Route
          path="/admin/login"
          element={
            <GuestOnlyRoute>{withSuspense(<LoginPage />)}</GuestOnlyRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <GuestOnlyRoute>{withSuspense(<RegisterPage />)}</GuestOnlyRoute>
          }
        />
        <Route
          path="/admin/register-manager"
          element={
            <GuestOnlyRoute>{withSuspense(<ManagerRegisterPage />)}</GuestOnlyRoute>
          }
        />
        <Route
          path="/admin/forgot-password"
          element={
            <GuestOnlyRoute>{withSuspense(<ForgotPasswordPage />)}</GuestOnlyRoute>
          }
        />
      </Route>

      {/* ── Protected admin area ────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={withSuspense(<DashboardPage />)} />
        <Route path="listings" element={withSuspense(<ManageListingsPage />)} />
        <Route
          path="listings/create"
          element={withSuspense(<CreateListingPage />)}
        />
        <Route path="profile" element={withSuspense(<ProfilePage />)} />
        <Route
          path="managers"
          element={
            <SuperAdminOnlyRoute>
              {withSuspense(<ManagersPage />)}
            </SuperAdminOnlyRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);