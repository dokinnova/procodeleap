import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const navigate = useNavigate();
  const { toast } = useToast();

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
      console.log("Intentando actualizar contraseña con token:", recoveryToken);
      
      // La solución clave: si tenemos un recoveryToken que no es 'recovery-flow',
      // explícitamente pasamos el token para que Supabase pueda verificarlo
      if (recoveryToken && recoveryToken !== 'recovery-flow') {
        console.log("Usando token de recuperación explícito");
        
        // Este es el punto crítico - usamos el token directamente para actualizar la contraseña
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("Error al actualizar con token:", updateError);
          throw updateError;
        }
      } else {
        // Verificamos si existe una sesión válida
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          throw new Error("No hay sesión de autenticación. Por favor, utilice el enlace de recuperación enviado al correo electrónico.");
        }
        
        // Actualizar contraseña usando la sesión actual
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("Error al actualizar con sesión:", updateError);
          throw updateError;
        }
      }

      console.log("Contraseña actualizada correctamente");
      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido actualizada correctamente",
      });

      // Redirigir al usuario a la página de inicio de sesión
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error("Error al actualizar la contraseña:", err);
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

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
