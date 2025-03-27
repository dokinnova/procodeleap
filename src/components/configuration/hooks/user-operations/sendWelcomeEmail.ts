
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserPermissions";

type SendWelcomeEmailParams = {
  email: string;
  userRole: UserRole;
};

/**
 * Sends a welcome email to the newly created user
 */
export const sendWelcomeEmail = async ({ email, userRole }: SendWelcomeEmailParams) => {
  console.log("Sending welcome email to:", email);
  
  // Send welcome email - with administrator rights
  const adminSessionResponse = await supabase.auth.getSession();
  if (!adminSessionResponse.data.session) {
    console.error("No admin session available for sending welcome email");
    toast.error("No se pudo enviar el email de bienvenida: No hay sesión activa");
    return { message: "Usuario añadido, pero no se pudo enviar el email de bienvenida." };
  }
  
  try {
    console.log("Using admin session for sending email");
    
    const response = await supabase.functions.invoke('send-mass-email', {
      body: {
        recipients: [{ email, name: email.split('@')[0] }],
        subject: 'Bienvenido a PROCODELI',
        content: `
          <div>
            <h2>¡Bienvenido a PROCODELI!</h2>
            <p>Tu cuenta ha sido creada exitosamente con el rol de ${
              userRole === 'admin' ? 'administrador' : 
              userRole === 'editor' ? 'editor' : 
              'visualizador'
            }.</p>
            <p>Ya puedes acceder al sistema usando tu email y contraseña.</p>
            <p>Si tienes alguna pregunta, no dudes en contactar con el administrador del sistema.</p>
          </div>
        `
      },
      method: 'POST'
    });

    const { data: emailData, error: emailError } = response;

    console.log("Email function response:", response);

    if (emailError) {
      console.error("Error sending welcome email:", emailError);
      console.error("Full error object:", JSON.stringify(emailError));
      throw new Error(`Error en el envío del email: ${JSON.stringify(emailError)}`);
    }

    console.log("Welcome email function response:", emailData);
    
    // Check for errors in email results
    if (emailData?.error?.includes("Resend sólo permite enviar emails al propietario")) {
      toast.warning(emailData.error);
      return { message: "Usuario añadido. " + emailData.error };
    }
    
    // Check for errors in email results
    if (emailData?.results?.[0]?.error) {
      const errorMsg = typeof emailData.results[0].error === 'string' 
        ? emailData.results[0].error
        : JSON.stringify(emailData.results[0].error);
      console.warn("Email error from results:", errorMsg);
      toast.warning(`Usuario añadido pero hubo un problema con el email: ${errorMsg}`);
      return { message: `Usuario añadido. Error en el envío del email: ${errorMsg}` };
    }
    
    return { message: "Usuario añadido correctamente. Se ha enviado un email de bienvenida." };
  } catch (emailErr: any) {
    console.error("Error sending welcome email:", emailErr);
    console.error("Full error object:", JSON.stringify(emailErr));
    // Don't throw here, as the user creation was successful
    toast.error(`No se pudo enviar el email de bienvenida: ${emailErr.message || 'Error desconocido'}`);
    return { message: "Usuario añadido, pero no se pudo enviar el email de bienvenida." };
  }
};
