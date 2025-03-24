
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DirectPasswordChangeTab } from "./DirectPasswordChangeTab";
import { EmailResetTab } from "./EmailResetTab";
import { AlertCircle, Info } from "lucide-react";

interface PasswordChangeContentProps {
  userEmail: string;
  onSendResetEmail: (email: string) => void;
  onDirectPasswordChange?: (email: string, newPassword: string) => void;
  isLoading: boolean;
  isDirectChangeLoading: boolean;
  error: string | null;
  directChangeError: string | null;
  success: boolean;
  directChangeSuccess: boolean;
}

export const PasswordChangeContent = ({
  userEmail,
  onSendResetEmail,
  onDirectPasswordChange,
  isLoading,
  isDirectChangeLoading,
  error,
  directChangeError,
  success,
  directChangeSuccess
}: PasswordChangeContentProps) => {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  if (success || directChangeSuccess) {
    return (
      <p className="text-center text-sm text-gray-600">
        {success ? 
          "El usuario ha recibido un email para cambiar su contraseña." : 
          "La contraseña ha sido cambiada exitosamente."}
      </p>
    );
  }

  return (
    <>
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
        
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Enviar email</TabsTrigger>
          <TabsTrigger value="direct">Cambio directo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-4">
          <EmailResetTab 
            userEmail={userEmail}
            onSendResetEmail={onSendResetEmail}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="direct" className="space-y-4">
          <DirectPasswordChangeTab 
            onDirectPasswordChange={onDirectPasswordChange || (() => {})}
            userEmail={userEmail}
            isLoading={isDirectChangeLoading}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
