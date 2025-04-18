
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";

interface EmailResetTabProps {
  userEmail: string;
  onSendResetEmail: (email: string) => void;
  isLoading: boolean;
}

export const EmailResetTab = ({
  userEmail,
  onSendResetEmail,
  isLoading,
}: EmailResetTabProps) => {
  const handleSendPasswordResetEmail = () => {
    onSendResetEmail(userEmail);
  };

  return (
    <div className="space-y-4 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">Este es el método estándar y seguro para cambiar contraseñas</p>
          Al hacer clic en el botón, se enviará un correo electrónico al usuario con un enlace para establecer una nueva contraseña.
          El usuario recibirá el correo electrónico y podrá crear su nueva contraseña de forma segura.
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
    </div>
  );
};
