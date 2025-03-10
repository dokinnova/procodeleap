
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          console.log("Código de autenticación detectado");
          
          try {
            // Intercambiar el código por una sesión
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              searchParams.get("code") as string
            );
            
            if (error) {
              console.error("Error al procesar código de autenticación:", error);
              
              if (isPasswordReset) {
                // Si es un reset de contraseña con error, ir a la página de reset
                console.log("Redirigiendo a página de reset con error");
                navigate(`/password-reset${location.search}`, { replace: true });
              } else {
                // Si es login normal con error, mostrar mensaje y volver a auth
                console.error("Error de autenticación:", error.message);
                toast.error("Error al iniciar sesión: " + error.message);
                navigate("/auth", { replace: true });
              }
              return;
            }
            
            console.log("Código procesado exitosamente:", data?.session ? "Sesión establecida" : "Sin sesión");
            
            // Si es un reset de contraseña, redirigir a la página correspondiente
            if (isPasswordReset) {
              console.log("Redirigiendo a página de reset");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // Para login normal, redirigir al dashboard
              console.log("Sesión iniciada correctamente, redirigiendo al inicio");
              toast.success("Sesión iniciada correctamente");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("Error en intercambio de código:", error);
            if (isPasswordReset) {
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              toast.error("Error al procesar la autenticación");
              navigate("/auth", { replace: true });
            }
          }
        } else {
          // Si no hay código, redirigir a la página de inicio de sesión
          console.log("No se encontró código, redirigiendo a inicio de sesión");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Error crítico en callback:", error);
        toast.error("Error durante el proceso de autenticación");
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
