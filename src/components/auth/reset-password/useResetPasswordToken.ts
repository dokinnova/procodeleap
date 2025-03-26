import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useResetPasswordToken = () => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // Debug logs
  console.log("ResetPassword: Component loaded with:");
  console.log("- Full URL:", window.location.href);
  console.log("- Location pathname:", location.pathname);
  console.log("- Location search:", location.search);
  console.log("- Location hash:", location.hash);
  console.log("- Route params:", params);

  useEffect(() => {
    const extractTokenFromUrl = () => {
      // 1. Extract from query params
      const searchParams = new URLSearchParams(location.search);
      const queryToken = searchParams.get('token');
      const queryCode = searchParams.get('code');
      const queryType = searchParams.get('type');
      
      // 2. Extract from URL path parameters 
      const routeToken = params.token;
      
      // 3. Extract from hash fragment (#)
      let hashToken = null;
      try {
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashToken = hashParams.get('access_token');
        }
      } catch (e) {
        console.error("Error parsing hash:", e);
      }
      
      console.log("Extracted tokens:", { queryToken, queryCode, routeToken, hashToken, queryType });
      
      // Return the first valid token found
      return queryCode || queryToken || routeToken || hashToken || 
             (queryType === 'recovery' ? 'recovery-flow' : null);
    };

    const processAuthSession = async () => {
      try {
        setIsProcessingToken(true);
        
        // Extract token from URL
        const token = extractTokenFromUrl();
        console.log("Token extracted from URL:", token);
        
        if (token) {
          // If we have a token or recovery code in the URL
          console.log("Found token in URL:", token);
          setRecoveryToken(token);
          
          // If there's a code parameter in the URL, process it to exchange for a session
          if (location.search.includes('code=')) {
            console.log("Processing recovery code:", location.search);
            
            try {
              // This step is critical: exchange the code for a session
              const { data, error } = await supabase.auth.exchangeCodeForSession(location.search);
              
              if (error) {
                console.error("Error exchanging code for session:", error);
                setError("Error processing recovery code: " + error.message);
              } else {
                console.log("Code successfully exchanged for session:", data);
                
                // Remove the parameters from the URL but keep the path to avoid issues
                // when refreshing the page
                if (location.search) {
                  navigate(`/reset-password?processed=true&token=${token}`, { replace: true });
                }
              }
            } catch (exchangeError) {
              console.error("Error during code exchange:", exchangeError);
              setError("Error processing authentication");
            }
          }
        } else {
          console.log("No token found in URL, checking session state...");
          
          // Check if there is an active Supabase session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            console.log("Active session found, user already authenticated");
            setRecoveryToken('session-active');
          } else {
            // If we're on the reset-password route but without a token, assume it's
            // the recovery request page
            if (location.pathname.includes('reset-password')) {
              console.log("On reset-password route without token, showing request form");
              setRecoveryToken('recovery-flow');
            } else {
              console.log("No active session and no token found");
              setRecoveryToken(null);
            }
          }
        }
      } catch (err) {
        console.error("Error processing session/token:", err);
        setError("Error processing authentication");
      } finally {
        setIsProcessingToken(false);
      }
    };

    processAuthSession();
    
    // Subscribe to auth state changes to update status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session ? "With session" : "No session");
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log("PASSWORD_RECOVERY event detected");
        setRecoveryToken('recovery-token-event');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [location, params, navigate]);

  return { recoveryToken, error, isProcessingToken };
};
