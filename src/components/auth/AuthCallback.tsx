
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
        // Extract all URL parameters
        const searchParams = new URLSearchParams(location.search);
        
        // Convert to an object for debugging
        const params = Object.fromEntries(searchParams.entries());
        console.log("Callback parameters received:", params);
        
        // Check if we're in a password reset flow
        const isPasswordReset = searchParams.has("type") && searchParams.get("type") === "recovery";
        const hasCode = searchParams.has("code");
        
        if (hasCode) {
          console.log("Authentication code detected");
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              searchParams.get("code") as string
            );
            
            if (error) {
              console.error("Error processing authentication code:", error);
              setError(error.message);
              
              if (isPasswordReset) {
                // If it's a password reset with an error, redirect to reset page
                console.log("Redirecting to password reset page with error");
                navigate(`/password-reset${location.search}`, { replace: true });
              } else {
                // If it's a normal login with an error, show message and redirect to auth
                console.error("Authentication error:", error.message);
                toast.error("Error de inicio de sesión: " + error.message);
                navigate("/auth", { replace: true });
              }
              return;
            }
            
            console.log("Code processed successfully:", data?.session ? "Session established" : "No session");
            
            // If it's a password reset, redirect to the reset page
            if (isPasswordReset) {
              console.log("Redirecting to password reset page");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // For normal login, redirect to dashboard
              console.log("Session started successfully, redirecting to home");
              toast.success("Sesión iniciada correctamente");
              
              // Delay the navigation slightly to ensure session is properly set
              setTimeout(() => {
                navigate("/", { replace: true });
              }, 500);
            }
          } catch (error: any) {
            console.error("Error in code exchange:", error);
            setError(error.message);
            
            if (isPasswordReset) {
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              toast.error("Error al procesar la autenticación");
              navigate("/auth", { replace: true });
            }
          }
        } else {
          // If there's no code, redirect to the sign in page
          console.log("No code found, redirecting to sign in");
          navigate("/auth", { replace: true });
        }
      } catch (error: any) {
        console.error("Critical error in callback:", error);
        setError(error.message);
        toast.error("Error durante el proceso de autenticación");
        navigate("/auth", { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  // Show a loading indicator while processing
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
