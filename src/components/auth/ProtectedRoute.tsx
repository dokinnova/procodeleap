
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Rutas que no requieren autenticación
  const publicRoutes = [
    '/auth',
    '/reset-password',
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith(route + '/') ||
    location.search.includes('type=recovery') || 
    location.search.includes('code=')
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Para rutas públicas, siempre permitir acceso
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Para rutas protegidas, verificar autenticación
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};
