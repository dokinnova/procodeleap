
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  recoveryToken?: string | null;
}

export const ResetPasswordForm = ({ 
  setError, 
  loading, 
  setLoading,
  recoveryToken
}: ResetPasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const navigate = useNavigate();
  const { toast: toastUI } = useToast();

  // Check for active session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("ResetPasswordForm - Session state:", data.session ? "With session" : "No session");
        
        // Log the access token for debugging if session exists
        if (data.session) {
          console.log("ResetPasswordForm - Session exists with access token (first 10 chars):", 
                      data.session.access_token.substring(0, 10) + "...");
        }
        
        setHasCheckedSession(true);
      } catch (err) {
        console.error("Error checking session:", err);
        setHasCheckedSession(true);
      }
    };
    
    checkSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to update password with token:", recoveryToken ? "Token exists" : "No token");
      
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session state when updating password:", 
                sessionData.session ? "With session" : "No session");
      
      if (!sessionData.session && recoveryToken && recoveryToken !== 'recovery-flow' && recoveryToken !== 'session-active') {
        console.log("No session but recovery token exists. Attempting to use token directly:", recoveryToken);
        
        try {
          // Try to use the recovery token to update the password
          const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (updateError) {
            console.error("Error updating password with token:", updateError);
            
            // If this fails, it could be because the token is in a different format
            if (updateError.message.includes("JWT") || updateError.message.includes("token")) {
              setError("El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo desde la página de inicio de sesión.");
            } else {
              throw updateError;
            }
          } else {
            console.log("Password updated successfully using token");
            toast.success("Tu contraseña ha sido actualizada correctamente");
            
            // Redirect to login page after successful password update
            setTimeout(() => {
              navigate("/auth", { replace: true });
            }, 2000);
          }
        } catch (tokenError) {
          console.error("Token update attempt failed:", tokenError);
          throw tokenError;
        }
      } else if (sessionData.session) {
        // We have a session, use it to update the password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("Error updating password with session:", updateError);
          throw updateError;
        }

        console.log("Password updated successfully using session");
        toast.success("Tu contraseña ha sido actualizada correctamente");

        // Redirect to login page
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      } else {
        // No session and no valid token
        setError("No hay sesión de autenticación o el token no es válido. Por favor, utiliza el enlace de recuperación enviado al correo electrónico o solicita uno nuevo.");
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      
      // Check if the error is about an expired token
      if (err.message && (
          err.message.includes("Token expired") || 
          err.message.includes("token is invalid") ||
          err.message.includes("JWT expired"))) {
        setError("El enlace de recuperación ha expirado. Por favor, solicita uno nuevo desde la página de inicio de sesión.");
      } else if (err.message && err.message.includes("Auth session missing")) {
        setError("La sesión de autenticación no se encuentra. Por favor, asegúrate de usar el enlace completo enviado al correo electrónico o solicita uno nuevo.");
      } else {
        setError(err.message || "Error al actualizar la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasCheckedSession) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ingrese su nueva contraseña"
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme su nueva contraseña"
          disabled={loading}
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : "Actualizar contraseña"}
      </Button>
    </form>
  );
};
