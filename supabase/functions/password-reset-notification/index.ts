
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password reset notification function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key first to fail fast
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured properly - RESEND_API_KEY is missing");
    }

    console.log(`RESEND_API_KEY starting with: ${RESEND_API_KEY.substring(0, 5)}...`);
    
    const { email, resetLink }: PasswordResetRequest = await req.json();
    
    if (!email) {
      throw new Error("No email provided");
    }

    console.log(`Sending password reset email to ${email}`);
    
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [email],
          subject: "Restablecimiento de contraseña",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6; margin-bottom: 24px;">Restablecimiento de contraseña</h1>
              <p style="margin-bottom: 16px;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
              <a href="${resetLink}" style="display: inline-block; background-color: #8B5CF6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-bottom: 16px;">Restablecer contraseña</a>
              <p style="margin-bottom: 16px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este enlace expirará en 24 horas.</p>
            </div>
          `,
        }),
      });

      const result = await response.json();
      
      console.log(`Full Resend API response for ${email}:`, JSON.stringify(result));
      
      if (!response.ok) {
        console.error(`Error sending to ${email}:`, result);
        return new Response(JSON.stringify({ success: false, error: result }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`Password reset email sent successfully to ${email}:`, result);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      
    } catch (err) {
      console.error(`Exception sending to ${email}:`, err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error in password reset notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
