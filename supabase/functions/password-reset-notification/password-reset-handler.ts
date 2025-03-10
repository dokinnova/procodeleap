
import { corsHeaders } from "./cors-headers.ts";
import { sendEmail } from "./email-sender.ts";
import { getResetEmailContent } from "./email-templates.ts";

export const handlePasswordReset = async (
  email: string,
  resetLink: string,
  RESEND_API_KEY: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<Response> => {
  if (!email) {
    throw new Error("No email provided");
  }

  console.log(`Processing password reset email to ${email}`);
  console.log(`Redirect base: ${resetLink}`);

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    console.log("Requesting password reset token from Supabase Auth");

    // Make request to Supabase Auth API to get password reset token
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
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Supabase Auth error:", errorData);
      throw new Error(`Supabase Auth error: ${errorData.message || errorData.error || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("Successfully requested reset token from Supabase");

    // Asegurar que la URL de redirección sea correcta
    const resetUrl = `${resetLink}?token=${data.token}`;
    console.log("Reset URL generated:", resetUrl);
    
    const htmlContent = getResetEmailContent(resetUrl);
    
    const { success, result, error } = await sendEmail(
      email,
      "Restablecimiento de contraseña",
      htmlContent,
      RESEND_API_KEY
    );

    if (!success) {
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
};
