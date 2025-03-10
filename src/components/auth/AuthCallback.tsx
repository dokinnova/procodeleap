
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
        const hasToken = searchParams.has("token");
        
        // If we have a direct token from Supabase's email link
        if (hasToken) {
          console.log("Direct token detected, redirecting to password reset page");
          navigate(`/password-reset${location.search}`, { replace: true });
          return;
        }
        
        if (hasCode) {
          console.log("Authentication code detected, processing...");
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              searchParams.get("code") as string
            );
            
            if (error) {
              console.error("Error processing authentication code:", error);
              navigate(`/password-reset${location.search}`, { replace: true });
              return;
            }
            
            console.log("Code processed successfully:", data?.session ? "Session established" : "No session");
            
            // If it's a password reset, redirect to the reset page
            if (isPasswordReset) {
              console.log("Redirecting to password reset page");
              navigate(`/password-reset${location.search}`, { replace: true });
            } else {
              // For normal login, redirect to dashboard
              console.log("Redirecting to dashboard");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("Error in code exchange:", error);
            navigate(`/password-reset${location.search}`, { replace: true });
          }
        } else {
          // If no code or token, redirect to password reset page
          console.log("No code or token found, redirecting to login");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Critical callback error:", error);
        navigate("/auth", { replace: true });
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
