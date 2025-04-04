
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    setDetailedError(null);
    setIsLoggingIn(true);
    
    if (!email || !password) {
      setLoginError("Por favor ingresa tu correo electrónico y contraseña");
      setIsLoggingIn(false);
      return;
    }
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log("Intentando iniciar sesión con email:", normalizedEmail);
      console.log("Longitud de la contraseña:", password.length);
      
      // Skip app_users check and directly try authentication - this is critical for fixing the issue
      console.log("Intentando autenticar directamente con email:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (error) {
        console.error("Error de inicio de sesión:", error);
        setDetailedError(JSON.stringify(error, null, 2));
        
        // Now check if user exists in app_users after failed login
        const { data: appUsers } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", normalizedEmail);
          
        if (appUsers && appUsers.length > 0) {
          console.log("Usuario sí existe en app_users pero fallo de autenticación:", appUsers[0]);
          
          if (error.message.includes("Invalid login credentials")) {
            setLoginError("Contraseña incorrecta. El usuario existe pero la contraseña es inválida.");
            toast.error("Credenciales de inicio de sesión inválidas");
            setLoginAttempts(prev => prev + 1);
          } else if (error.message.includes("Email not confirmed")) {
            setLoginError("El correo electrónico aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada.");
            toast.error("Email no confirmado");
          } else {
            setLoginError(error.message);
            toast.error(`Error de inicio de sesión: ${error.message}`);
          }
        } else {
          // User doesn't exist in app_users
          console.log("Usuario no encontrado en app_users:", normalizedEmail);
          setLoginError("No se encontró ninguna cuenta con este correo electrónico. Por favor, verifica o contacta al administrador.");
          setDetailedError(`Email no encontrado: ${normalizedEmail}`);
        }
      } else if (data?.user) {
        console.log("Login successful:", data);
        toast.success("Inicio de sesión exitoso");
        navigate('/', { replace: true });
      } else {
        setLoginError("Error desconocido durante el inicio de sesión");
        toast.error("Error desconocido durante el inicio de sesión");
      }
    } catch (err: any) {
      console.error("Error inesperado durante el inicio de sesión:", err);
      setLoginError(err.message);
      setDetailedError(JSON.stringify(err, null, 2));
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
      
      {detailedError && (
        <Alert variant="destructive" className="mb-4 text-xs overflow-auto max-h-32">
          <details>
            <summary className="cursor-pointer">Ver detalles del error (para diagnóstico)</summary>
            <pre className="whitespace-pre-wrap">{detailedError}</pre>
          </details>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
