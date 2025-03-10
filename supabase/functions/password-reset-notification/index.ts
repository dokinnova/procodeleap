
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./cors-headers.ts";
import { handleConfirmation } from "./confirmation-handler.ts";
import { handlePasswordReset } from "./password-reset-handler.ts";

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

interface PasswordChangeConfirmation {
  email: string;
  type: "confirmation";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password reset notification function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service is not properly configured - Missing RESEND_API_KEY");
    }

    console.log(`RESEND_API_KEY is configured and available`);
    
    const requestData = await req.json();
    const { type } = requestData;

    // Handle password change confirmation email
    if (type === "confirmation") {
      const { email } = requestData as PasswordChangeConfirmation;
      return await handleConfirmation(email, RESEND_API_KEY);
    }

    // Handle password reset request email
    const { email, resetLink } = requestData as PasswordResetRequest;
    return await handlePasswordReset(
      email,
      resetLink,
      RESEND_API_KEY,
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
  } catch (error) {
    console.error("Error in password reset notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);

