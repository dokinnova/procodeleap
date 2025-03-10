
import { corsHeaders } from "./cors-headers.ts";

interface EmailResponse {
  success: boolean;
  result?: any;
  error?: any;
}

export const sendEmail = async (
  email: string,
  subject: string,
  htmlContent: string,
  RESEND_API_KEY: string
): Promise<EmailResponse> => {
  console.log("Attempting to send email through Resend API");
  console.log("Request data:", JSON.stringify({
    from: "noreply@tuaplicacion.com",
    to: [email],
    subject,
    html: htmlContent
  }));

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "noreply@tuaplicacion.com",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    const responseStatus = emailResponse.status;
    console.log(`Resend API response status: ${responseStatus}`);
    
    const result = await emailResponse.json();
    console.log(`Resend API response for ${email}:`, JSON.stringify(result));

    if (!emailResponse.ok) {
      console.error(`Error sending to ${email}:`, result);
      return { success: false, error: result };
    }

    console.log(`Email sent successfully to ${email}`);
    return { success: true, result };
  } catch (err) {
    console.error(`Exception when sending to ${email}:`, err);
    return { success: false, error: err.message };
  }
};

