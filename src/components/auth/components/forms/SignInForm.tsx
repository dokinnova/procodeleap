
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
      // Add detailed logging to help diagnose the issue
      console.log("Intentando iniciar sesión con email:", email);
      console.log("Longitud de la contraseña:", password.length);
      
      // Comprobación adicional de la contraseña antes de enviar
      if (password.length < 6) {
        setLoginError("La contraseña debe tener al menos 6 caracteres");
        setIsLoggingIn(false);
        return;
      }
      
      // Normalizar el email
      const normalizedEmail = email.trim().toLowerCase();
      
      // Log the exact input values that will be sent to the API
      console.log("Enviando solicitud de inicio de sesión con:", {
        email: normalizedEmail,
        passwordLength: password.length
      });
      
      // Verificar si el usuario existe en app_users pero no tiene un user_id válido
      try {
        const { data: appUser } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", normalizedEmail)
          .eq("user_id", "00000000-0000-0000-0000-000000000000")
          .maybeSingle();
        
        if (appUser) {
          console.log("Usuario encontrado en app_users pero con ID temporal:", appUser);
          setLoginError("Este usuario está pendiente de confirmación en el sistema. Por favor, contacta con el administrador.");
          setIsLoggingIn(false);
          return;
        }
      } catch (checkError) {
        console.log("Error al verificar usuario en app_users:", checkError);
        // Continuar con el intento de inicio de sesión normal
      }
      
      // Verificar primero si el usuario existe en auth.users
      try {
        // Verificar con un intento de inicio de sesión con contraseña incorrecta
        const { error: checkError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: "TemporaryCheckPassword123!@#"
        });
        
        const userExistsInAuth = checkError && checkError.message && 
                               checkError.message.includes("Invalid login credentials");
        
        if (!userExistsInAuth) {
          console.log("El usuario no existe en el sistema de autenticación");
          setLoginError("El usuario no existe en el sistema. Por favor, regístrate o contacta al administrador.");
          setIsLoggingIn(false);
          return;
        }
      } catch (checkError) {
        console.log("Error al verificar existencia del usuario:", checkError);
        // Continuar con el intento normal de inicio de sesión
      }
      
      // Ahora intentar el inicio de sesión real
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (error) {
        console.error("Error de inicio de sesión manual:", error);
        console.error("Código de error:", error.status, "Mensaje:", error.message);
        
        // Guardar detalles completos del error para diagnóstico
        setDetailedError(JSON.stringify(error, null, 2));
        
        if (error.message.includes("Invalid login credentials")) {
          // Provide more specific error message to help diagnose
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
