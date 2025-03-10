
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
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service is not properly configured - Missing RESEND_API_KEY");
    }

    console.log(`RESEND_API_KEY is configured and available`);
    
    const { email, resetLink }: PasswordResetRequest = await req.json();
    
    if (!email) {
      throw new Error("No email provided");
    }

    console.log(`Processing password reset email to ${email}`);
    console.log(`Redirect base: ${resetLink}`);
    
    try {
      // Primero, hacemos un request a Supabase Auth para generar un token de recuperación
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }
      
      console.log("Requesting password reset token from Supabase Auth");
      
      const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          gotrue_meta_security: {
            captcha_token: ""
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Supabase Auth error:", errorData);
        throw new Error(`Supabase Auth error: ${errorData.message || errorData.error || "Unknown error"}`);
      }
      
      console.log("Successfully requested reset token from Supabase");

      // Determine origin from resetLink
      const url = new URL(resetLink);
      const origin = url.origin;
      
      console.log(`Using origin: ${origin}`);
      
      // Create properly formatted reset link pointing to our app
      const formattedResetLink = `${origin}/password-reset?type=recovery&email=${encodeURIComponent(email)}`;
      
      console.log(`Formatted reset link: ${formattedResetLink}`);
      
      const emailContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6; margin-bottom: 24px;">Restablecimiento de contraseña</h1>
          <p style="margin-bottom: 16px;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${formattedResetLink}" style="display: inline-block; background-color: #8B5CF6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-bottom: 16px;">Restablecer contraseña</a>
          <p style="margin-bottom: 16px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este enlace expirará en 24 horas.</p>
        </div>
      `;
      
      console.log("Attempting to send email through Resend API");
      console.log("Request data:", JSON.stringify({
        from: "noreply@tuaplicacion.com",
        to: [email],
        subject: "Restablecimiento de contraseña",
        html: emailContent
      }));
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "noreply@tuaplicacion.com",
          to: [email],
          subject: "Restablecimiento de contraseña",
          html: emailContent,
        }),
      });

      const responseStatus = emailResponse.status;
      console.log(`Resend API response status: ${responseStatus}`);
      
      const result = await emailResponse.json();
      
      console.log(`Resend API response for ${email}:`, JSON.stringify(result));
      
      if (!emailResponse.ok) {
        console.error(`Error sending to ${email}:`, result);
        return new Response(JSON.stringify({ success: false, error: result }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`Password reset email sent successfully to ${email}`);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      
    } catch (err) {
      console.error(`Exception when sending to ${email}:`, err);
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
