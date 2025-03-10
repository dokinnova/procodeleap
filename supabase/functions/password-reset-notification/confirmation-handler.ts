
import { corsHeaders } from "./cors-headers.ts";
import { sendEmail } from "./email-sender.ts";
import { getConfirmationEmailContent } from "./email-templates.ts";

export const handleConfirmation = async (
  email: string,
  RESEND_API_KEY: string
): Promise<Response> => {
  console.log(`Sending password change confirmation to ${email}`);

  const htmlContent = getConfirmationEmailContent();
  const { success, result, error } = await sendEmail(
    email,
    "Tu contraseña ha sido actualizada",
    htmlContent,
    RESEND_API_KEY
  );

  if (!success) {
    console.error(`Error sending confirmation email to ${email}:`, error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`Password change confirmation email sent successfully to ${email}`);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

