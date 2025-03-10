
export const getConfirmationEmailContent = () => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #8B5CF6; margin-bottom: 24px;">Contraseña actualizada</h1>
    <p style="margin-bottom: 16px;">Tu contraseña ha sido actualizada exitosamente.</p>
    <p style="margin-bottom: 16px;">Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
    <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
  </div>
`;

export const getResetEmailContent = (formattedResetLink: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #8B5CF6; margin-bottom: 24px;">Restablecimiento de contraseña</h1>
    <p style="margin-bottom: 16px;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <a href="${formattedResetLink}" style="display: inline-block; background-color: #8B5CF6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-bottom: 16px;">Restablecer contraseña</a>
    <p style="margin-bottom: 16px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
    <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">Este enlace expirará en 24 horas.</p>
  </div>
`;
