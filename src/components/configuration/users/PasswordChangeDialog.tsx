
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
import { AlertCircle, Info } from "lucide-react";
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
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [directChangeAttempted, setDirectChangeAttempted] = useState(false);

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
    setDirectChangeAttempted(true);
    
    try {
      // Try to update the password using admin API
      console.log(`Attempting to update password for user ${userId} with admin API`);
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) {
        console.error("Admin password update failed:", updateError);
        
        // Check if it's a permission error
        if (updateError.message.includes("Service role auth") || 
            updateError.message.includes("not admin") ||
            updateError.message.includes("roles")) {
          throw new Error("No tienes permisos de administrador para cambiar la contraseña directamente. Utilizando método alternativo.");
        }
        
        throw updateError;
      }

      console.log("Password updated successfully via admin API");
      toast.success("Contraseña actualizada correctamente");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error changing password:", err);
      
      // If it's a permissions issue, automatically try the email reset method
      if (err.message.includes("permisos") || 
          err.message.includes("roles") || 
          err.message.includes("admin")) {
        console.log("Permission issue detected, trying password reset email");
        await handleSendPasswordResetEmail();
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
      
      console.log(`Sending password reset email to ${userEmail} with redirect to ${redirectTo}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: redirectTo
      });
      
      if (error) {
        console.error("Error sending password reset email:", error);
        throw error;
      }
      
      console.log("Password reset email sent successfully");
      setPasswordResetSent(true);
      toast.success("Email de recuperación enviado correctamente");
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
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
        
        {directChangeAttempted && !passwordResetSent && !error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Si tiene problemas para cambiar la contraseña directamente, 
              utilice la opción de enviar email de recuperación.
            </AlertDescription>
          </Alert>
        )}
        
        {passwordResetSent ? (
          <div className="py-4">
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cerrar
              </Button>
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
              <div className="text-sm text-gray-500 mt-4">
                <p>Si la actualización directa de contraseña no funciona, también puedes:</p>
                <Button 
                  type="button"
                  variant="link" 
                  className="h-auto p-0 text-primary"
                  onClick={handleSendPasswordResetEmail}
                  disabled={isLoading}
                >
                  Enviar email de recuperación
                </Button>
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
