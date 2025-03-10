
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { AuthForm } from "./components/auth/AuthForm";
import { ResetPassword } from "./components/auth/ResetPassword";
import { AuthProvider } from "./components/auth/components/AuthProvider";

// Import all page components
import Index from "./pages/Index";
import Children from "./pages/Children";
import Sponsors from "./pages/Sponsors";
import Management from "./pages/Management";
import Schools from "./pages/Schools";
import Configuration from "./pages/Configuration";
import Receipts from "./pages/Receipts";
import CRM from "./pages/CRM";
import ChildrenReport from "./pages/reports/ChildrenReport";
import SponsorsReport from "./pages/reports/SponsorsReport";
import SchoolsReport from "./pages/reports/SchoolsReport";
import SponsorshipsReport from "./pages/reports/SponsorshipsReport";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Tasks from "./pages/Tasks";
import Map from "./pages/Map";

const queryClient = new QueryClient();

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Close mobile menu when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        !target.closest('.navigation-sidebar') &&
        !target.closest('button[aria-label="Abrir menú"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public authentication routes */}
              <Route path="/auth" element={
                <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
                  <div className="max-w-md mx-auto w-full px-4">
                    <div className="mb-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">COPRODELI</h1>
                      <p className="text-gray-600">Inicia sesión para continuar</p>
                    </div>
                    <AuthForm />
                  </div>
                </div>
              } />
              
              {/* Password reset routes - ensure all possible formats are handled */}
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Add specific types of recovery URLs that Supabase might generate */}
              <Route path="/auth/recovery" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<ResetPassword />} />
              
              {/* Catch all routes with type=recovery or token */}
              <Route path="/" element={
                (window.location.search.includes('type=recovery') || 
                 window.location.search.includes('code=') ||
                 window.location.search.includes('token=')) ? 
                  <Navigate to={`/reset-password${window.location.search}`} replace /> : 
                  <ProtectedRoute>
                    <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50">
                      <Navigation 
                        isMobileMenuOpen={isMobileMenuOpen} 
                        setIsMobileMenuOpen={setIsMobileMenuOpen} 
                      />
                      <main 
                        className={`flex-1 transition-all duration-300 ease-in-out
                          ${isMobileMenuOpen ? 'ml-0' : 'ml-0 md:ml-64'} 
                          p-4 md:p-8 overflow-auto`}
                      >
                        <div className="max-w-7xl mx-auto space-y-8">
                          <Index />
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
              } />
              
              {/* Ruta para capturar el index y redirigir si es necesario */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              
              {/* Protected routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50">
                    <Navigation 
                      isMobileMenuOpen={isMobileMenuOpen} 
                      setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    />
                    <main 
                      className={`flex-1 transition-all duration-300 ease-in-out
                        ${isMobileMenuOpen ? 'ml-0' : 'ml-0 md:ml-64'} 
                        p-4 md:p-8 overflow-auto`}
                    >
                      <div className="max-w-7xl mx-auto space-y-8">
                        <Routes>
                          <Route path="/children" element={<Children />} />
                          <Route path="/sponsors" element={<Sponsors />} />
                          <Route path="/management" element={<Management />} />
                          <Route path="/schools" element={<Schools />} />
                          <Route path="/configuration" element={<Configuration />} />
                          <Route path="/receipts" element={<Receipts />} />
                          <Route path="/crm" element={<CRM />} />
                          <Route path="/tasks" element={<Tasks />} />
                          <Route path="/map" element={<Map />} />
                          <Route path="/reports/children" element={<ChildrenReport />} />
                          <Route path="/reports/sponsors" element={<SponsorsReport />} />
                          <Route path="/reports/schools" element={<SchoolsReport />} />
                          <Route path="/reports/sponsorships" element={<SponsorshipsReport />} />
                          <Route path="/business-intelligence" element={<BusinessIntelligence />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
