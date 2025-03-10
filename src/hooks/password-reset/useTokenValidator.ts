
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionVerifier } from "./useSessionVerifier";
import { useOtpCodeVerifier } from "./useOtpCodeVerifier";

export const useTokenValidator = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [forceRequestMode, setForceRequestMode] = useState(false);
  
  const { verifySession, session, setSession, loading } = useSessionVerifier();
  const { verifyCodeWithEmail } = useOtpCodeVerifier();
  
  const validateToken = async (
    token?: string | null,
    code?: string | null,
    type?: string | null,
    emailParam?: string | null,
    errorParam?: string | null, 
    errorDescription?: string | null,
    accessToken?: string | null,
    refreshToken?: string | null
  ) => {
    console.log("Validating token/code for password reset...");
    console.log("Parameters:", { 
      token: token ? "Present" : "Not present", 
      code: code ? "Present" : "Not present", 
      type, 
      emailParam: emailParam ? "Present" : "Not present",
      accessToken: accessToken ? "Present" : "Not present" 
    });
    
    try {
      // Mark as checked to stop showing loading state
      setTokenChecked(true);
      
      // Check for error parameters in URL
      if (errorParam) {
        console.error("Error in URL parameters:", errorParam, errorDescription);
        return { 
          error: errorDescription || "Error in recovery link", 
          setRequestMode: true 
        };
      }
      
      // If we have a token, code, or access token, attempt to verify
      if (token || code || accessToken || refreshToken) {
        // First check if we already have an active session
        const { hasSession, session: currentSession, error: sessionError } = await verifySession();
        
        if (sessionError) {
          console.error("Session verification error:", sessionError);
        }
        
        if (hasSession && currentSession) {
          console.log("Existing session detected");
          setSession(currentSession);
          setIsTokenValid(true);
          return { success: true };
        }
        
        // Handle recovery code with email parameter
        if (code && emailParam && type === 'recovery') {
          console.log("Attempting to verify code with provided email");
          try {
            const { success, session: verifiedSession, error } = await verifyCodeWithEmail(code, emailParam);
            
            if (error) {
              console.error("Error verifying code with email:", error);
            }
            
            if (success && verifiedSession) {
              setIsTokenValid(true);
              setSession(verifiedSession);
              return { success: true };
            }
          } catch (err) {
            console.error("Error during code verification:", err);
          }
        }
        
        // Handle just a code (from Supabase's auth.resetPasswordForEmail)
        if (code) {
          console.log("Recovery code without email, trying directly");
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error exchanging code:", error);
            } else if (data?.session) {
              console.log("Code successfully exchanged, session established");
              setSession(data.session);
              setIsTokenValid(true);
              return { success: true };
            }
          } catch (exchangeErr) {
            console.error("Error exchanging code:", exchangeErr);
          }
        }
        
        // Handle access token and refresh token
        if (accessToken && refreshToken) {
          console.log("Attempting to use access and refresh tokens");
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error("Error setting session with tokens:", error);
            } else if (data?.session) {
              console.log("Session established with tokens");
              setSession(data.session);
              setIsTokenValid(true);
              return { success: true };
            }
          } catch (setSessionErr) {
            console.error("Error setting session:", setSessionErr);
          }
        }
        
        // If all verification attempts failed
        console.log("Could not verify token/code");
        setForceRequestMode(true);
        return { 
          error: "The recovery link is invalid or has expired. Please request a new one.", 
          setRequestMode: true 
        };
      }
      
      // No token, code, or access token parameters
      console.log("No token or code found in URL, request mode");
      setForceRequestMode(true);
      return { setRequestMode: true };
    } catch (err: any) {
      console.error("Error validating token:", err);
      setTokenChecked(true);
      setForceRequestMode(true);
      return { 
        error: err.message || "Error validating the recovery link", 
        setRequestMode: true 
      };
    }
  };
  
  return {
    validateToken,
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession,
    verifySession,
    verifyCodeWithEmail,
    loading
  };
};
