
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

export const PasswordChangeDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
}: PasswordChangeDialogProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordResetOption, setShowPasswordResetOption] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      // Only admins can update user passwords
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) {
        throw updateError;
      }

      toast.success("Contraseña actualizada correctamente");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al cambiar la contraseña:", err);
      if (err.message.includes("Service role auth")) {
        setShowPasswordResetOption(true);
        setError("No tienes permisos suficientes para cambiar la contraseña directamente. Usa la opción de enviar email de recuperación.");
      } else {
        setError(err.message || "Error al cambiar la contraseña");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current origin for the redirect
      const origin = window.location.origin;
      // Create a specific reset password URL that we know will work
      const redirectTo = `${origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: redirectTo
      });
      
      if (error) throw error;
      
      setPasswordResetSent(true);
      toast.success("Email de recuperación enviado correctamente");
    } catch (err: any) {
      console.error("Error al enviar email de recuperación:", err);
      setError(err.message || "Error al enviar email de recuperación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {passwordResetSent 
              ? `Se ha enviado un email de recuperación a ${userEmail}`
              : `Establece una nueva contraseña para ${userEmail}`
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showPasswordResetOption || passwordResetSent ? (
          <div className="py-4">
            {!passwordResetSent && (
              <p className="text-sm text-gray-500 mb-4">
                Puedes enviar un email de recuperación al usuario para que pueda restablecer su contraseña directamente.
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cerrar
              </Button>
              {!passwordResetSent && (
                <Button 
                  onClick={handleSendPasswordResetEmail} 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar email de recuperación"}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa la nueva contraseña"
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
                  placeholder="Confirma la nueva contraseña"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
