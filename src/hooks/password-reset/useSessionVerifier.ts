
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const useSessionVerifier = () => {
  const [session, setSession] = useState<Session | null>(null);

  const verifySession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData?.session;
    
    console.log("Sesión actual:", currentSession ? "Presente" : "Ausente");
    
    if (currentSession) {
      setSession(currentSession);
    }
    
    return { 
      hasSession: !!currentSession, 
      session: currentSession 
    };
  };

  return {
    verifySession,
    session,
    setSession
  };
};
