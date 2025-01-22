import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./AuthForm";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('ProtectedRoute: Checking session...');
    
    // Initialize session on component mount
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('ProtectedRoute: Error checking session:', error);
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        });
        setSession(null);
        navigate('/auth', { replace: true });
      } else if (!currentSession) {
        console.log('ProtectedRoute: No session found');
        setSession(null);
        navigate('/auth', { replace: true });
      } else {
        console.log('ProtectedRoute: Session found:', currentSession);
        setSession(currentSession);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('ProtectedRoute: Auth state changed:', _event);
      
      if (session) {
        console.log('ProtectedRoute: Setting session');
        setSession(session);
      } else {
        console.log('ProtectedRoute: Clearing session');
        setSession(null);
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-4">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">PROCODELI</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};