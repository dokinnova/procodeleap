
import { Navigate, RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthForm } from "@/components/auth/AuthForm";
import PasswordReset from "@/pages/PasswordReset";
import AuthCallback from "@/components/auth/AuthCallback";
import MainLayout from "@/layouts/MainLayout";

// Import all page components
import Index from "@/pages/Index";
import Children from "@/pages/Children";
import Sponsors from "@/pages/Sponsors";
import Management from "@/pages/Management";
import Schools from "@/pages/Schools";
import Configuration from "@/pages/Configuration";
import Receipts from "@/pages/Receipts";
import CRM from "@/pages/CRM";
import ChildrenReport from "@/pages/reports/ChildrenReport";
import SponsorsReport from "@/pages/reports/SponsorsReport";
import SchoolsReport from "@/pages/reports/SchoolsReport";
import SponsorshipsReport from "@/pages/reports/SponsorshipsReport";
import BusinessIntelligence from "@/pages/BusinessIntelligence";
import Tasks from "@/pages/Tasks";
import Map from "@/pages/Map";

// Public routes that don't require authentication
export const publicRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: <AuthForm />
  },
  {
    path: "/password-reset",
    element: <PasswordReset />
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />
  },
  {
    path: "/",
    element: window.location.search.includes('code=') ? 
      <Navigate to={`/password-reset${window.location.search}`} replace /> : 
      <Navigate to="/auth" replace />
  }
];

// Protected routes that require authentication
export const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Index /> },
      { path: "/children", element: <Children /> },
      { path: "/sponsors", element: <Sponsors /> },
      { path: "/management", element: <Management /> },
      { path: "/schools", element: <Schools /> },
      { path: "/configuration", element: <Configuration /> },
      { path: "/receipts", element: <Receipts /> },
      { path: "/crm", element: <CRM /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/map", element: <Map /> },
      { path: "/reports/children", element: <ChildrenReport /> },
      { path: "/reports/sponsors", element: <SponsorsReport /> },
      { path: "/reports/schools", element: <SchoolsReport /> },
      { path: "/reports/sponsorships", element: <SponsorshipsReport /> },
      { path: "/business-intelligence", element: <BusinessIntelligence /> }
    ]
  }
];

// All routes combined
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  // Catch-all route for any undefined paths
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
];
