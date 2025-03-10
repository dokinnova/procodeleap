
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTokenValidation = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [forceRequestMode, setForceRequestMode] = useState(false);
  const [session, setSession] = useState(null);

  const validateToken = async (
    token: string | null,
    code: string | null,
    type: string | null,
    emailParam: string | null,
    errorParam: string | null,
    errorDescription: string | null,
    accessToken: string | null,
    refreshToken: string | null
  ) => {
    setIsTokenValid(false);
    setTokenChecked(false);
    setForceRequestMode(false);

    // If there are explicit errors in URL, return error state
    if (errorParam || errorDescription) {
      console.log("Error detected in URL parameters");
      setTokenChecked(true);
      setForceRequestMode(true);
      return {
        error: "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo."
      };
    }

    // If no token parameters present, return request mode state
    if (!token && !code && !accessToken && !refreshToken) {
      console.log("No token, code or access_token present, setting request mode");
      setTokenChecked(true);
      return { setRequestMode: true };
    }

    // Check for active session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Current session:", sessionData?.session ? "Present" : "Absent");

    if (sessionData?.session) {
      console.log("Active session found");
      setSession(sessionData.session);
      setIsTokenValid(true);
      setTokenChecked(true);
      return { success: true };
    }

    // Verify OTP code if present
    if (code && type === "recovery" && emailParam) {
      try {
        console.log("Attempting to verify recovery code directly");
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email: emailParam,
          token: code,
          type: 'recovery'
        });

        if (verifyError) {
          console.error("Error verifying OTP:", verifyError);
          setIsTokenValid(false);
          const isExpiredError = verifyError.message && (
            verifyError.message.includes("expired") ||
            verifyError.message.includes("invalid") ||
            verifyError.message.includes("not found")
          );
          const errorMessage = isExpiredError
            ? "El enlace de recuperación ha expirado. Por favor solicita uno nuevo."
            : verifyError.message;
          return { error: errorMessage };
        }

        if (data?.session) {
          console.log("OTP verified successfully, session established");
          setSession(data.session);
          setIsTokenValid(true);
        } else {
          console.log("OTP verified but no session obtained");
          setIsTokenValid(true);
        }
      } catch (err) {
        console.error("Error verifying code:", err);
        setIsTokenValid(false);
        return { error: "Ocurrió un error al verificar el enlace de recuperación" };
      }
      setTokenChecked(true);
      return { success: true };
    }

    // Special case for type=recovery without code but with email
    // This is our custom flow where we don't pass the actual token in the URL
    if (type === "recovery" && emailParam && !code) {
      console.log("Custom recovery flow detected");
      setIsTokenValid(true);
      setTokenChecked(true);
      return { success: true };
    }

    // Handle other token types
    if (token || accessToken || refreshToken || (code && type === "recovery")) {
      try {
        console.log("Assuming valid token for reset form");
        setIsTokenValid(true);
      } catch (err) {
        console.error("Error validating token:", err);
        setIsTokenValid(false);
        return { error: "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo." };
      }
      setTokenChecked(true);
      return { success: true };
    }

    console.log("No valid recovery method found in URL");
    setIsTokenValid(false);
    setTokenChecked(true);
    return { error: "El enlace de recuperación es inválido. Por favor solicita uno nuevo." };
  };

  return {
    isTokenValid,
    tokenChecked,
    forceRequestMode,
    session,
    setSession,
    validateToken
  };
};
