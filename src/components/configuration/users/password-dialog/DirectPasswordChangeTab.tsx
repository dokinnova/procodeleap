
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react";

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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <p className="font-medium mb-1">Esta opción no está disponible en este momento</p>
          El cambio directo de contraseñas requiere permisos especiales de Supabase (service_role) 
          que no están disponibles en la aplicación web por razones de seguridad. 
          Por favor, utilice la opción de "Enviar email".
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
            disabled={true}
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
            disabled={true}
          />
        </div>
        
        <Button
          onClick={handleDirectPasswordChange}
          disabled={true}
          className="w-full"
        >
          Cambiar contraseña
        </Button>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Para implementar esta funcionalidad se requeriría exponer claves de servicio privadas 
            de Supabase en el frontend, lo cual es un riesgo de seguridad. Le recomendamos utilizar 
            la opción de "Enviar email" que es segura y funcional.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
