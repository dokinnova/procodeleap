
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecoveryFormProps {
  onToggleView: () => void;
  setLoginError: (error: string | null) => void;
  loginError: string | null;
}

export const RecoveryForm = ({ onToggleView, setLoginError, loginError }: RecoveryFormProps) => {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Get current URL for redirect - ensure we use the actual origin that will handle the reset
  const currentUrl = window.location.origin;
  
  // Use the exact format that Supabase expects for the reset URL
  // This is critical - we need to make sure we're using the /reset-password route directly
  const redirectTo = `${currentUrl}/reset-password`;

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail) {
      setLoginError("Por favor ingresa tu correo electrónico para la recuperación");
      return;
    }
    
    setIsRecovering(true);
    try {
      // Make sure we set redirectTo correctly to prevent the "invalid flow state" error
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: redirectTo
      });
      
      if (error) {
        console.error("Error al enviar email de recuperación:", error);
        setLoginError(`Error al enviar el email de recuperación: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success("Email de recuperación enviado. Por favor, revisa tu bandeja de entrada.");
        onToggleView();
        setLoginError(null);
      }
    } catch (err: any) {
      console.error("Error inesperado durante la recuperación:", err);
      setLoginError(err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <>
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handlePasswordRecovery} className="space-y-4 mb-4">
        <div>
          <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700">
            Correo electrónico para recuperación
          </label>
          <input
            id="recovery-email"
            type="email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Tu correo electrónico"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isRecovering}>
          {isRecovering ? "Enviando..." : "Enviar instrucciones de recuperación"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <Button 
          variant="link" 
          className="text-primary"
          onClick={onToggleView}
        >
          Volver a inicio de sesión
        </Button>
      </div>
    </>
  );
};
