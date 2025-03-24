
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  
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
      toast.error(err.message || "Error al enviar email de recuperación");
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
              : `Para cambiar la contraseña de ${userEmail}, se enviará un email de recuperación`
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!passwordResetSent && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Para cambiar la contraseña, se enviará un correo electrónico con un enlace para establecer una nueva contraseña.
              El usuario recibirá un correo electrónico y podrá hacer clic en el enlace para restablecer su contraseña.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          {passwordResetSent ? (
            <p className="text-center text-sm text-gray-600">
              Por favor, indique al usuario que revise su bandeja de entrada y siga las instrucciones en el correo electrónico para establecer una nueva contraseña.
            </p>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={handleSendPasswordResetEmail}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Enviando..." : "Enviar email de recuperación"}
              </Button>
            </div>
          )}
        </div>
        
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
      </DialogContent>
    </Dialog>
  );
};
