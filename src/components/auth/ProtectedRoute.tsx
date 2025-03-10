
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLoading } from "./components/AuthLoading";
import { AuthRequired } from "./components/AuthRequired";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error verificando sesión en ProtectedRoute:", error);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          console.log("No hay sesión en ProtectedRoute, mostrando AuthRequired");
          setSession(null);
        } else {
          console.log("Sesión válida en ProtectedRoute");
          setSession(data.session);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error inesperado en ProtectedRoute:", error);
        setSession(null);
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);
  
  if (loading) {
    return <AuthLoading />;
  }
  
  if (!session) {
    return <AuthRequired />;
  }
  
  return <>{children}</>;
};
