
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

export default AuthCallback;
