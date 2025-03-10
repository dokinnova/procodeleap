import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

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
import PasswordReset from "./pages/PasswordReset";
import { AuthForm } from "./components/auth/AuthForm";

const queryClient = new QueryClient();

// Componente para manejar el callback de autenticación de Supabase
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extraer todos los parámetros de la URL
        const searchParams = new URLSearchParams(location.search);
        
        // Convertir a un objeto para debug
        const params = Object.fromEntries(searchParams.entries());
        console.log("Parámetros de callback recibidos:", params);
        
        // Verificar si estamos en una redirección de recuperación de contraseña
        const isPasswordReset = searchParams.has("type") && searchParams.get("type") === "recovery";
        const hasCode = searchParams.has("code");
        
        if (hasCode) {
          console.log("Código de autenticación detectado, procesando...");
          
          try {
            // Intentar intercambiar el código por una sesión
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              searchParams.get("code") as string
            );
            
            if (error) {
              console.error("Error al procesar código de autenticación:", error);
              // Preservar todos los parámetros y redirigir a la página de reset
              navigate(`/password-reset${location.search}`, { replace: true });
              return;
            }
            
            console.log("Código procesado correctamente:", data?.session ? "Sesión establecida" : "Sin sesión");
            
            // Si es una redirección de password reset, mandar a esa página en vez del dashboard
            if (isPasswordReset || searchParams.has("token")) {
              console.log("Redirigiendo a página de reset de contraseña");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // Si es un login normal, redirigir al dashboard
              console.log("Redirigiendo al dashboard");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("Error general en callback:", error);
            navigate(`/password-reset${location.search}`, { replace: true });
          }
        } else {
          // Si no hay código, simplemente redirigir a la página de reset con los parámetros
          console.log("No se encontró código, redirigiendo a página de reset");
          navigate(`/password-reset${location.search}`, { replace: true });
        }
      } catch (error) {
        console.error("Error crítico en callback:", error);
        navigate("/password-reset", { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  // Mostrar un indicador de carga mientras se procesa
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">Procesando autenticación...</p>
      </div>
    </div>
  );
};

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
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            
            {/* Redirect root path with code parameter to password reset */}
            <Route path="/" element={
              window.location.search.includes('code=') ? 
              <Navigate to={`/password-reset${window.location.search}`} replace /> : 
              <Navigate to="/auth" replace />
            } />
            
            {/* Protected routes - require authentication */}
            <Route path="*" element={
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
                        <Route path="/" element={<Index />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
