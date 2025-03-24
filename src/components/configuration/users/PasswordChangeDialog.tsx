
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onSendResetEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const PasswordChangeDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  onSendResetEmail,
  isLoading,
  error,
  success,
}: PasswordChangeDialogProps) => {
  
  const handleSendPasswordResetEmail = () => {
    console.log(`Solicitando envío de email de recuperación a ${userEmail}`);
    onSendResetEmail(userEmail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {success 
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
        
        {!success && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Para cambiar la contraseña, se enviará un correo electrónico con un enlace para establecer una nueva contraseña.
              El usuario recibirá un correo electrónico y podrá hacer clic en el enlace para restablecer su contraseña.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          {success ? (
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : "Enviar email de recuperación"}
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
