
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { toast } = useToast();

  useEffect(() => {
    // Extraer token de la URL y parámetros
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type");
    const token = queryParams.get("token");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    console.log("Verificando token de recuperación:");
    console.log("- Tipo (query):", type);
    console.log("- Token (query):", token);
    console.log("- Access Token (hash):", accessToken);
    
    if (type === "recovery" && token) {
      console.log("Token de recuperación detectado (query):", token);
      setRecoveryToken(token);
    } else if (accessToken) {
      console.log("Token de acceso detectado (hash):", accessToken);
      setRecoveryToken(accessToken);
    } else {
      console.log("No se encontró token de recuperación válido");
      
      // Verificar estado actual de autenticación para password recovery
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          console.log("Sesión activa encontrada durante recuperación");
          setRecoveryToken("session-active");
        } else {
          // No mostrar error inmediatamente, podría ser acceso directo a la página
          if (location.search || window.location.hash) {
            setError("Enlace de recuperación inválido o expirado.");
          }
        }
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <AuthLogo />
            </div>
            <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
            <CardDescription>
              Por favor, introduce tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese su nueva contraseña"
                  disabled={loading || !recoveryToken}
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
                  disabled={loading || !recoveryToken}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !recoveryToken}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : "Actualizar contraseña"}
              </Button>
              
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  type="button"
                  onClick={() => navigate("/auth")}
                >
                  Volver a inicio de sesión
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
