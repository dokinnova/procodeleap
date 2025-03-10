
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
  console.log("Función de notificación de restablecimiento de contraseña activada");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Manejando solicitud OPTIONS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key first to fail fast
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurada");
      throw new Error("El servicio de correo electrónico no está configurado correctamente - Falta RESEND_API_KEY");
    }

    console.log(`RESEND_API_KEY comienza con: ${RESEND_API_KEY.substring(0, 5)}...`);
    
    const { email, resetLink }: PasswordResetRequest = await req.json();
    
    if (!email) {
      throw new Error("No se proporcionó correo electrónico");
    }

    console.log(`Enviando correo de restablecimiento de contraseña a ${email}`);
    console.log(`Link original: ${resetLink}`);
    
    try {
      // Extract the code from the resetLink
      const url = new URL(resetLink);
      const code = url.searchParams.get('code');
      
      if (!code) {
        console.error("No se encontró código en el enlace de restablecimiento");
        throw new Error("Enlace de restablecimiento inválido - No se encontró código");
      }
      
      console.log(`Código extraído: ${code}`);
      
      // Determine the origin from request headers or URL
      let origin = req.headers.get('origin');
      
      // If origin header is missing, try to use the X-Forwarded-Host or Host header
      if (!origin) {
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        if (host) {
          // Determine if the connection is secure
          const proto = req.headers.get('x-forwarded-proto') || 'https';
          origin = `${proto}://${host}`;
        } else {
          // If all else fails, extract the origin from the resetLink
          origin = url.origin;
        }
      }
      
      console.log(`Origen determinado: ${origin}`);
      
      // Create the properly formatted reset link with the code
      const formattedResetLink = `${origin}/password-reset?code=${code}&type=recovery`;
      
      console.log(`Enlace formateado: ${formattedResetLink}`);
      
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
              <a href="${formattedResetLink}" style="display: inline-block; background-color: #8B5CF6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-bottom: 16px;">Restablecer contraseña</a>
              <p style="margin-bottom: 16px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este enlace expirará en 24 horas.</p>
            </div>
          `,
        }),
      });

      const result = await response.json();
      
      console.log(`Respuesta completa de la API Resend para ${email}:`, JSON.stringify(result));
      
      if (!response.ok) {
        console.error(`Error al enviar a ${email}:`, result);
        return new Response(JSON.stringify({ success: false, error: result }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`Correo de restablecimiento de contraseña enviado exitosamente a ${email}:`, result);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      
    } catch (err) {
      console.error(`Excepción al enviar a ${email}:`, err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error en la notificación de restablecimiento de contraseña:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
