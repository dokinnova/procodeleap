
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AuthLogo } from "../components/AuthLogo";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { RecoveryRequestForm } from "./RecoveryRequestForm";
import { useResetPasswordToken } from "./useResetPasswordToken";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ResetPasswordContainer = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const navigate = useNavigate();
  const { recoveryToken, error: tokenError, isProcessingToken } = useResetPasswordToken();

  useEffect(() => {
    if (tokenError) {
      setError(tokenError);
    }
  }, [tokenError]);

  useEffect(() => {
    // Check for a valid session when the component loads
    // and also force Supabase to process any tokens in the URL
    const checkSession = async () => {
      try {
        console.log("Checking session and processing tokens in URL...");
        
        // If there's a code in the URL, try to exchange it immediately
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          console.log("Found code in URL, attempting to exchange for session");
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.search);
            if (error) {
              console.error("Error exchanging code for session:", error);
              setError(`Error al procesar el código de recuperación: ${error.message}`);
            } else {
              console.log("Successfully exchanged code for session:", data);
              toast.success("Código de recuperación procesado correctamente");
            }
          } catch (err) {
            console.error("Exception during code exchange:", err);
          }
        }
        
        // Check session after processing tokens
        const { data } = await supabase.auth.getSession();
        console.log("Session state when loading ResetPasswordContainer:", 
                    data.session ? "With session" : "No session");
        
        setIsSessionReady(true);
      } catch (err) {
        console.error("Error checking session:", err);
        setIsSessionReady(true);
      }
    };
    
    checkSession();
  }, []);

  // Handle retry of code exchange if needed
  const handleRetryCodeExchange = async () => {
    setLoading(true);
    try {
      // Get the current URL's search parameters
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (!code) {
        setError("No se encontró un código de recuperación en la URL");
        return;
      }
      
      console.log("Retrying code exchange for:", code);
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.search);
      
      if (error) {
        console.error("Error during retry of code exchange:", error);
        setError(`Error al procesar el código: ${error.message}`);
      } else {
        console.log("Code exchange retry successful:", data);
        toast.success("Sesión establecida correctamente");
        setError(null);
      }
    } catch (err: any) {
      console.error("Exception during retry:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine which form to show based on recovery token
  const showPasswordResetForm = recoveryToken && 
                              recoveryToken !== "recovery-flow";
  
  if (isProcessingToken || !isSessionReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Verificando sesión...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <AuthLogo />
            </div>
            <CardTitle className="text-2xl">
              {showPasswordResetForm ? "Restablecer Contraseña" : "Recuperar Contraseña"}
            </CardTitle>
            <CardDescription>
              {showPasswordResetForm 
                ? "Por favor, introduce tu nueva contraseña" 
                : "Ingresa tu correo electrónico para recibir instrucciones"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                <p>{error}</p>
                {error.includes("Auth session missing") && (
                  <Button 
                    onClick={handleRetryCodeExchange}
                    className="mt-2 w-full"
                    disabled={loading}
                  >
                    Intentar procesar el código nuevamente
                  </Button>
                )}
              </div>
            )}
            
            {showPasswordResetForm ? (
              <ResetPasswordForm 
                setError={setError} 
                loading={loading} 
                setLoading={setLoading}
                recoveryToken={recoveryToken}
              />
            ) : (
              <RecoveryRequestForm 
                setError={setError} 
                loading={loading} 
                setLoading={setLoading} 
              />
            )}
            
            <div className="text-center mt-4">
              <button 
                className="text-primary underline-offset-4 hover:underline h-10 px-4 py-2 inline-flex items-center justify-center"
                type="button"
                onClick={() => navigate("/auth")}
              >
                Volver a inicio de sesión
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
