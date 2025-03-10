
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AuthLogo } from "../components/AuthLogo";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { RecoveryRequestForm } from "./RecoveryRequestForm";
import { useResetPasswordToken } from "./useResetPasswordToken";
import { supabase } from "@/integrations/supabase/client";

export const ResetPasswordContainer = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const navigate = useNavigate();
  const { recoveryToken } = useResetPasswordToken();

  // Verificar si hay una sesión válida cuando se carga el componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Estado de sesión al cargar ResetPasswordContainer:", data.session ? "Con sesión" : "Sin sesión");
        setIsSessionReady(true);
      } catch (err) {
        console.error("Error al verificar sesión:", err);
        setIsSessionReady(true);
      }
    };
    
    checkSession();
  }, []);

  // Determine which form to show based on recovery token
  const showPasswordResetForm = recoveryToken && 
                              recoveryToken !== "recovery-flow";
  
  if (!isSessionReady) {
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
                {error}
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
