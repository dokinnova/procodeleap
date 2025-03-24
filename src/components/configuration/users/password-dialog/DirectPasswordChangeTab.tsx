
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";

interface DirectPasswordChangeTabProps {
  onDirectPasswordChange: (email: string, newPassword: string) => void;
  userEmail: string;
  isLoading: boolean;
  passwordError: string | null;
  setPasswordError: (error: string | null) => void;
}

export const DirectPasswordChangeTab = ({
  onDirectPasswordChange,
  userEmail,
  isLoading,
  passwordError,
  setPasswordError,
}: DirectPasswordChangeTabProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    onDirectPasswordChange(userEmail, newPassword);
  };

  return (
    <div className="space-y-4 py-4">
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
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : "Cambiar contraseña"}
        </Button>
      </div>
    </div>
  );
};
