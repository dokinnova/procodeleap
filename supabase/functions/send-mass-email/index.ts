
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  email: string;
  name: string;
}

interface EmailRequest {
  recipients: Recipient[];
  subject: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, content }: EmailRequest = await req.json();
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured properly");
    }

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    console.log(`Attempting to send email to ${recipients.length} recipients:`, 
      recipients.map(r => r.email).join(', '));
    
    // Send emails in parallel
    const emailPromises = recipients.map(async recipient => {
      console.log(`Sending email to ${recipient.email}`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "PROCODELI <no-reply@resend.dev>",
          to: [recipient.email],
          subject: subject,
          html: `
            <div>
              <p>Hola ${recipient.name},</p>
              <div>${content}</div>
              <p>Saludos,<br/>El equipo de PROCODELI</p>
            </div>
          `,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(`Error sending to ${recipient.email}:`, result);
        return { email: recipient.email, success: false, error: result };
      }
      
      console.log(`Email sent successfully to ${recipient.email}:`, result);
      return { email: recipient.email, success: true, result };
    });

    const results = await Promise.all(emailPromises);
    console.log("All email results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending mass email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
