
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthLogo } from "@/components/auth/components/AuthLogo";
import { AuthContainer } from "@/components/auth/components/AuthContainer";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Check if we have a token or code in the URL parameters
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    
    if (token || code) {
      setMode("reset");
      
      // If we have a code from Supabase but not a token, handle that scenario
      if (code && !token) {
        const handleSupabaseCode = async () => {
          try {
            // This verifies the recovery code and sets the session
            const { error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token: code,
            });
            
            if (error) {
              console.error("Error al verificar el código:", error);
              toast.error("El enlace de recuperación no es válido o ha expirado");
              setError("El enlace de recuperación no es válido o ha expirado");
            }
          } catch (err) {
            console.error("Error al verificar el código:", err);
            toast.error("Ocurrió un error al procesar tu solicitud");
            setError("Ocurrió un error al procesar tu solicitud");
          }
        };
        
        handleSupabaseCode();
      }
    } else {
      setMode("request");
    }
  }, [searchParams]);

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
      // Don't navigate away, just show a success message
    } catch (err: any) {
      console.error("Error al solicitar restablecimiento de contraseña:", err);
      setError(err.message || "Error al solicitar restablecimiento de contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Contraseña actualizada correctamente");
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      setError(err.message || "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <AuthLogo />
          </div>
          <CardTitle className="text-2xl text-center">
            {mode === "request" ? "Recuperar contraseña" : "Crear nueva contraseña"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "request" 
              ? "Ingresa tu correo electrónico para recibir un enlace de recuperación"
              : "Ingresa tu nueva contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {mode === "request" ? (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Volver al inicio de sesión
          </Button>
        </CardFooter>
      </Card>
    </AuthContainer>
  );
};

export default PasswordReset;
