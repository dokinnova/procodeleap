
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const handleSendPasswordResetEmail = () => {
    console.log(`Solicitando envío de email de recuperación a ${userEmail}`);
    onSendResetEmail(userEmail);
  };

  const handleDirectPasswordChange = () => {
    if (!newPassword) {
      setPasswordError("La contraseña no puede estar vacía");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    
    setPasswordError(null);
    if (onDirectPasswordChange) {
      onDirectPasswordChange(userEmail, newPassword);
    }
  };

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
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
        
        {(error || directChangeError || passwordError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || directChangeError || passwordError}</AlertDescription>
          </Alert>
        )}
        
        {directChangeError && directChangeError.includes("permisos") && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              El cambio directo de contraseñas requiere permisos especiales de Supabase que no están 
              disponibles en la aplicación web. Por favor, usa la opción de "Enviar email" para 
              restablecer la contraseña del usuario.
            </AlertDescription>
          </Alert>
        )}
        
        {!success && !directChangeSuccess && (
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct">Cambio directo</TabsTrigger>
              <TabsTrigger value="email">Enviar email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="direct" className="space-y-4 py-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  El cambio directo de contraseñas requiere permisos especiales de Supabase. 
                  Si esta opción no funciona, utiliza la opción de "Enviar email".
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingrese la nueva contraseña" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme la nueva contraseña" 
                  />
                </div>
                
                <Button
                  onClick={handleDirectPasswordChange}
                  disabled={isDirectChangeLoading}
                  className="w-full"
                >
                  {isDirectChangeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : "Cambiar contraseña"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4 py-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para cambiar la contraseña, se enviará un correo electrónico con un enlace para establecer una nueva contraseña.
                  El usuario recibirá un correo electrónico y podrá hacer clic en el enlace para restablecer su contraseña.
                </AlertDescription>
              </Alert>
              
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
            </TabsContent>
          </Tabs>
        )}
        
        {(success || directChangeSuccess) && (
          <p className="text-center text-sm text-gray-600">
            {success ? 
              "El usuario ha recibido un email para cambiar su contraseña." : 
              "La contraseña ha sido cambiada exitosamente."}
          </p>
        )}
        
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
