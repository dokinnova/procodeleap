
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthLogo } from "./components/AuthLogo";

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Debug logs to help troubleshoot
  console.log("ResetPassword: Component loaded with:");
  console.log("- URL:", window.location.href);
  console.log("- Location search:", location.search);
  console.log("- Location hash:", window.location.hash);
  console.log("- Route params:", params);

  useEffect(() => {
    // Extract token from multiple possible sources
    const getTokenFromUrl = () => {
      // Check URL parameters
      const queryParams = new URLSearchParams(location.search);
      
      // Direct URL parameters
      const code = queryParams.get("code"); // For ?code=xxx format
      const token = queryParams.get("token");
      const type = queryParams.get("type");
      
      // Check route parameters
      const routeToken = params.token;
      
      // Check hash (for access tokens)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      console.log("Token extraction details:");
      console.log("- Code param:", code);
      console.log("- Token param:", token);
      console.log("- Type param:", type);
      console.log("- Route token:", routeToken);
      console.log("- Access token (hash):", accessToken);
      
      // Return the first valid token found
      return code || token || routeToken || (type === "recovery" ? "recovery-flow" : null) || accessToken;
    };
    
    const token = getTokenFromUrl();
    
    if (token) {
      console.log("Recovery token found:", token);
      setRecoveryToken(token);
      setError(null);
    } else {
      console.log("No recovery token found in URL");
      
      // Check if this is a recovery flow without a token in the URL
      const isRecoveryFlow = location.search.includes("type=recovery") || 
                            location.pathname.includes("reset-password");
      
      if (isRecoveryFlow) {
        console.log("Recovery flow detected without token");
        // This is the initiation page, allow password reset request
        setRecoveryToken("recovery-flow");
      } else {
        // Check if user has an active session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            console.log("Active session found during recovery");
            setRecoveryToken("session-active");
          } else if (location.search || window.location.hash) {
            // Show error only if we expected a token
            setError("Enlace de recuperación inválido o expirado.");
          }
        });
      }
    }
  }, [location, params]);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log("Intentando actualizar contraseña...");
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("Error al actualizar:", updateError);
        throw updateError;
      }

      console.log("Contraseña actualizada correctamente");
      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido actualizada correctamente",
      });

      // Redirigir al usuario a la página de inicio de sesión
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error("Error al actualizar la contraseña:", err);
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Get the hostname for the redirect
    const hostname = window.location.origin;
    const redirectTo = `${hostname}/reset-password`;

    try {
      const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
      
      if (!email) {
        throw new Error("Por favor, introduce tu correo electrónico");
      }

      console.log("Solicitando recuperación de contraseña para:", email);
      console.log("Con redirect a:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) {
        console.error("Error al solicitar restablecimiento:", error);
        throw error;
      }

      console.log("Solicitud de recuperación enviada correctamente");
      toast({
        title: "Solicitud enviada",
        description: "Revisa tu correo electrónico para restablecer tu contraseña",
      });
    } catch (err: any) {
      console.error("Error en recuperación de contraseña:", err);
      setError(err.message || "Error al solicitar recuperación de contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Determine which form to show based on recovery token
  const showPasswordResetForm = recoveryToken && 
                              recoveryToken !== "recovery-flow";
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <AuthLogo />
            </div>
            <CardTitle className="text-2xl">
              {showPasswordResetForm ? "Restablecer Contraseña" : "Recuperar Contraseña"}
            </CardTitle>
            <CardDescription>
              {showPasswordResetForm 
                ? "Por favor, introduce tu nueva contraseña" 
                : "Ingresa tu correo electrónico para recibir instrucciones"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {showPasswordResetForm ? (
              // Password reset form (when token is present)
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingrese su nueva contraseña"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme su nueva contraseña"
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : "Actualizar contraseña"}
                </Button>
              </form>
            ) : (
              // Password recovery request form (when no token)
              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : "Enviar instrucciones"}
                </Button>
              </form>
            )}
            
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                type="button"
                onClick={() => navigate("/auth")}
              >
                Volver a inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
