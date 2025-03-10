
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useResetPasswordToken = () => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const params = useParams();

  // Debug logs to help troubleshoot
  console.log("ResetPassword: Component loaded with:");
  console.log("- URL:", window.location.href);
  console.log("- Location search:", location.search);
  console.log("- Location hash:", window.location.hash);
  console.log("- Route params:", params);

  useEffect(() => {
    // Extract token from multiple possible sources
    const getTokenFromUrl = () => {
      // Check URL parameters (query string)
      const queryParams = new URLSearchParams(location.search);
      
      // Check for various parameter names used in different flows
      const code = queryParams.get("code"); // For ?code=xxx format
      const token = queryParams.get("token"); // For ?token=xxx format
      const type = queryParams.get("type"); // For ?type=recovery format
      
      // Check route parameters from different route patterns
      const routeToken = params.token; // For /reset-password/:token
      
      // Check hash fragment (for access tokens in some auth flows)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      // Try to extract token from path if it's in a non-standard format
      const pathSegments = location.pathname.split('/');
      let pathToken = null;
      
      // Look for token or code in the URL path
      for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i] === 'token' || pathSegments[i] === 'code') {
          // The token might be in the next segment
          pathToken = pathSegments[i + 1];
          break;
        }
      }
      
      console.log("Token extraction details:");
      console.log("- Code param:", code);
      console.log("- Token param:", token);
      console.log("- Type param:", type);
      console.log("- Route token:", routeToken);
      console.log("- Path token:", pathToken);
      console.log("- Access token (hash):", accessToken);
      
      // Return the first valid token found
      return code || token || routeToken || pathToken || (type === "recovery" ? "recovery-flow" : null) || accessToken;
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

  return { recoveryToken, error };
};
