
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extraer todos los parámetros de la URL
        const searchParams = new URLSearchParams(location.search);
        
        // Convertir a objeto para depuración
        const params = Object.fromEntries(searchParams.entries());
        console.log("Parámetros de callback recibidos:", params);
        
        // Verificar si estamos en un flujo de recuperación de contraseña
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
              console.error("Error procesando código de autenticación:", error);
              setError(error.message);
              
              if (isPasswordReset) {
                // Si es recuperación de contraseña con error, redirigir a página de reset
                console.log("Redirigiendo a página de reset de contraseña con error");
                navigate(`/password-reset${location.search}`, { replace: true });
              } else {
                // Si es inicio de sesión normal con error, mostrar mensaje y redirigir a auth
                console.error("Error de autenticación:", error.message);
                toast.error("Error de inicio de sesión: " + error.message);
                navigate("/auth", { replace: true });
              }
              return;
            }
            
            console.log("Código procesado correctamente:", data?.session ? "Sesión establecida" : "Sin sesión");
            
            // Si es recuperación de contraseña, redirigir a la página de reset
            if (isPasswordReset) {
              console.log("Redirigiendo a página de reset de contraseña");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // Para inicio de sesión normal, redirigir al dashboard
              console.log("Sesión iniciada correctamente, redirigiendo a home");
              toast.success("Sesión iniciada correctamente");
              
              // Usar setTimeout para evitar problemas de redirección instantánea
              setTimeout(() => {
                window.location.href = "/";
              }, 500);
            }
          } catch (error: any) {
            console.error("Error en intercambio de código:", error);
            setError(error.message);
            
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
      } catch (error: any) {
        console.error("Error crítico en callback:", error);
        setError(error.message);
        toast.error("Error durante el proceso de autenticación");
        navigate("/auth", { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  // Mostrar indicador de carga mientras se procesa
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50">
      <div className="text-center">
        {error ? (
          <div className="mb-4 text-red-500">
            <p>Error: {error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Procesando autenticación...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
