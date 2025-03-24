
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
    </div>
  );
};
