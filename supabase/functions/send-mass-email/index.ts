
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
  console.log("Email function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request headers for debugging
    console.log("Request headers:", Object.fromEntries([...req.headers.entries()]));
    
    // Verify API key first to fail fast
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured properly - RESEND_API_KEY is missing");
    }

    // Log first 5 characters of the API key to verify it's loaded (don't log full key)
    console.log(`RESEND_API_KEY starting with: ${RESEND_API_KEY.substring(0, 5)}...`);
    
    const { recipients, subject, content }: EmailRequest = await req.json();
    
    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    console.log(`Attempting to send email to ${recipients.length} recipients:`, 
      recipients.map(r => r.email).join(', '));
    
    // Send emails in parallel
    const emailPromises = recipients.map(async recipient => {
      console.log(`Sending email to ${recipient.email}`);
      
      try {
        // Use the validated domain address format from Resend documentation
        // Note: For testing, Resend only allows sending to the account owner's email
        // or emails on verified domains
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
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
        
        // Log full response for debugging
        console.log(`Full Resend API response for ${recipient.email}:`, JSON.stringify(result));
        
        if (!response.ok) {
          console.error(`Error sending to ${recipient.email}:`, result);
          return { email: recipient.email, success: false, error: result };
        }
        
        console.log(`Email sent successfully to ${recipient.email}:`, result);
        return { email: recipient.email, success: true, result };
      } catch (err) {
        console.error(`Exception sending to ${recipient.email}:`, err);
        return { email: recipient.email, success: false, error: err.message };
      }
    });

    const results = await Promise.all(emailPromises);
    console.log("All email results:", results);
    
    // Check if there were any Resend domain validation errors
    const domainValidationErrors = results.filter(r => 
      !r.success && 
      r.error?.message?.includes("You can only send testing emails to your own email address")
    );
    
    if (domainValidationErrors.length > 0) {
      console.warn("Resend domain validation errors detected. This is normal during testing.", 
        domainValidationErrors);
      
      return new Response(JSON.stringify({ 
        success: false, 
        results,
        error: "Resend sólo permite enviar emails al propietario de la cuenta durante pruebas. Verifica un dominio en Resend para enviar a cualquier dirección." 
      }), {
        status: 200, // Still return 200 to avoid triggering other error flows
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
