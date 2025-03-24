
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
import { PasswordChangeContent } from "./password-dialog/PasswordChangeContent";

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onSendResetEmail: (email: string) => void;
  onDirectPasswordChange?: (email: string, newPassword: string) => void;
  isLoading: boolean;
  isDirectChangeLoading?: boolean;
  error: string | null;
  directChangeError?: string | null;
  success: boolean;
  directChangeSuccess?: boolean;
}

export const PasswordChangeDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  onSendResetEmail,
  onDirectPasswordChange,
  isLoading,
  isDirectChangeLoading = false,
  error,
  directChangeError = null,
  success,
  directChangeSuccess = false,
}: PasswordChangeDialogProps) => {
  const resetForm = () => {
    // Form state is now managed within the child components
  };
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(value) => {
        if (!value) resetForm();
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {success || directChangeSuccess
              ? `La contraseña del usuario ${userEmail} ha sido actualizada`
              : `Cambia la contraseña para ${userEmail}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <PasswordChangeContent 
          userEmail={userEmail}
          onSendResetEmail={onSendResetEmail}
          onDirectPasswordChange={onDirectPasswordChange}
          isLoading={isLoading}
          isDirectChangeLoading={isDirectChangeLoading}
          error={error}
          directChangeError={directChangeError}
          success={success}
          directChangeSuccess={directChangeSuccess}
        />
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isDirectChangeLoading}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
