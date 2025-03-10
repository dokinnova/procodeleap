
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extract all parameters from the URL
        const searchParams = new URLSearchParams(location.search);
        
        // Convert to an object for debugging
        const params = Object.fromEntries(searchParams.entries());
        console.log("Callback parameters received:", params);
        
        // Check if we're in a password reset flow
        const isPasswordReset = searchParams.has("type") && searchParams.get("type") === "recovery";
        const hasCode = searchParams.has("code");
        
        if (hasCode) {
          console.log("Authentication code detected, processing...");
          
          try {
            // Try to exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              searchParams.get("code") as string
            );
            
            if (error) {
              console.error("Error processing authentication code:", error);
              // Preserve all parameters and redirect to reset page
              navigate(`/password-reset${location.search}`, { replace: true });
              return;
            }
            
            console.log("Code processed successfully:", data?.session ? "Session established" : "No session");
            
            // If it's a password reset redirect, send to that page instead of dashboard
            if (isPasswordReset || searchParams.has("token")) {
              console.log("Redirecting to password reset page");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // If it's a normal login, redirect to dashboard
              console.log("Redirecting to dashboard");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("General callback error:", error);
            navigate(`/password-reset${location.search}`, { replace: true });
          }
        } else {
          // If no code, simply redirect to reset page with parameters
          console.log("No code found, redirecting to reset page");
          navigate(`/password-reset${location.search}`, { replace: true });
        }
      } catch (error) {
        console.error("Critical callback error:", error);
        navigate("/password-reset", { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, location]);
  
  // Show a loading indicator while processing
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
