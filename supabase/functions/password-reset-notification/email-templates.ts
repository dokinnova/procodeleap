
export const getConfirmationEmailContent = () => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #8B5CF6; margin-bottom: 24px;">Contraseña actualizada</h1>
    <p style="margin-bottom: 16px;">Tu contraseña ha sido actualizada exitosamente.</p>
    <p style="margin-bottom: 16px;">Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
    <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
  </div>
`;

export const getResetEmailContent = (resetLink: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #8B5CF6; margin-bottom: 24px;">Recuperar contraseña</h1>
    <p style="margin-bottom: 16px;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
    <a href="${resetLink}" style="display: inline-block; background-color: #8B5CF6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin: 24px 0;">Crear nueva contraseña</a>
    <p style="margin-bottom: 16px;">Si no solicitaste cambiar tu contraseña, puedes ignorar este correo.</p>
    <p style="margin-bottom: 16px;">Por razones de seguridad, este enlace expirará en 24 horas.</p>
    <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
  </div>
`;
