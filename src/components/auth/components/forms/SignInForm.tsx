
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SignInFormProps {
  onToggleView: () => void;
  setLoginAttempts: (callback: (prev: number) => number) => void;
}

export const SignInForm = ({ onToggleView, setLoginAttempts }: SignInFormProps) => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setLoginError("Por favor ingresa tu correo electrónico y contraseña");
      setIsLoggingIn(false);
      return;
    }
    
    try {
      console.log("Intentando iniciar sesión con email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Error de inicio de sesión manual:", error);
        console.error("Código de error:", error.status, "Mensaje:", error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Credenciales de inicio de sesión inválidas. Verifica tu correo y contraseña o usa la opción 'Olvidé mi contraseña'.");
          toast.error("Credenciales de inicio de sesión inválidas");
          setLoginAttempts(prev => prev + 1);
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError("El correo electrónico aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada y confirma tu correo.");
          toast.error("Email no confirmado");
        } else {
          setLoginError(error.message);
          toast.error(`Error de inicio de sesión: ${error.message}`);
        }
      } else {
        console.log("Inicio de sesión manual exitoso:", data);
        toast.success("Inicio de sesión exitoso");
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error("Error inesperado durante el inicio de sesión:", err);
      setLoginError(err.message);
      toast.error(`Error inesperado: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
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
      
      <form onSubmit={handleManualLogin} className="space-y-4 mb-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email" 
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Tu correo electrónico"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Tu contraseña"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <Button 
          variant="link" 
          className="text-primary"
          onClick={onToggleView}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>
    </>
  );
};
