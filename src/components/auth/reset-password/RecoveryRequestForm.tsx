
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RecoveryRequestFormProps {
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const RecoveryRequestForm = ({ 
  setError, 
  loading, 
  setLoading 
}: RecoveryRequestFormProps) => {
  const { toast } = useToast();

  const handlePasswordRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Get the current origin for the redirect
    const hostname = window.location.origin;
    // Use a simple path that works on all domains
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

  return (
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
  );
};
