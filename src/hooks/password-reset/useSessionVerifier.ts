
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const useSessionVerifier = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for session on initial load
    const initialSessionCheck = async () => {
      try {
        setLoading(true);
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking initial session:", error);
        } else if (sessionData?.session) {
          console.log("Initial session found:", sessionData.session ? "Present" : "Absent");
          setSession(sessionData.session);
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
      } finally {
        setLoading(false);
      }
    };

    initialSessionCheck();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifySession = async () => {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error verifying session:", error);
        return { hasSession: false, session: null, error };
      }
      
      const currentSession = sessionData?.session;
      console.log("Current session:", currentSession ? "Present" : "Absent");
      
      if (currentSession) {
        setSession(currentSession);
      }
      
      return { 
        hasSession: !!currentSession, 
        session: currentSession,
        error: null
      };
    } catch (err) {
      console.error("Unexpected error verifying session:", err);
      return { hasSession: false, session: null, error: err };
    }
  };

  return {
    verifySession,
    session,
    setSession,
    loading
  };
};
