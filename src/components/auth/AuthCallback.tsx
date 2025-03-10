
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extraer todos los parámetros de la URL
        const searchParams = new URLSearchParams(location.search);
        
        // Convertir a un objeto para depuración
        const params = Object.fromEntries(searchParams.entries());
        console.log("Parámetros de callback recibidos:", params);
        
        // Verificar si estamos en un flujo de restablecimiento de contraseña
        const isPasswordReset = searchParams.has("type") && searchParams.get("type") === "recovery";
        const hasCode = searchParams.has("code");
        
        if (hasCode) {
          console.log("Código de autenticación detectado, redirigiendo a página de reset");
          
          // Redirigir inmediatamente a la página de restablecimiento con todos los parámetros
          navigate(`/password-reset${location.search}`, { replace: true });
          return;
        } else {
          // Si no hay código, redirigir a la página de inicio de sesión
          console.log("No se encontró código, redirigiendo a inicio de sesión");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Error crítico en callback:", error);
        navigate("/auth", { replace: true });
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

export default AuthCallback;
