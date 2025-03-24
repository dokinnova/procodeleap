
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
      
      // If we have a session or recovery token, proceed with password update
      if (sessionData.session || recoveryToken) {
        // Update password using the session
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("Error updating password:", updateError);
          throw updateError;
        }

        console.log("Password updated successfully");
        // Use sonner toast correctly
        toast.success("Tu contraseña ha sido actualizada correctamente");

        // Redirect to login page
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      } else {
        // No session and no token
        setError("No hay sesión de autenticación. Por favor, utilice el enlace de recuperación enviado al correo electrónico o solicite uno nuevo.");
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      
      // Check if the error is about an expired token
      if (err.message && (
          err.message.includes("Token expired") || 
          err.message.includes("token is invalid") ||
          err.message.includes("JWT expired"))) {
        setError("El enlace de recuperación ha expirado. Por favor, solicita uno nuevo desde la página de inicio de sesión.");
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
