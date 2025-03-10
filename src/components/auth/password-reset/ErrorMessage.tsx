
interface ErrorMessageProps {
  error: string | null;
  success?: string | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, success, className = '' }) => {
  if (!error && !success) return null;
  
  // Convert English error messages to Spanish
  let translatedError = error;
  if (error) {
    if (error.includes("invalid") || error.includes("expired")) {
      translatedError = "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.";
    } else if (error === "Email link is invalid or has expired") {
      translatedError = "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.";
    }
  }
  
  if (success) {
    return (
      <div className={`bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4 ${className}`}>
        {success}
      </div>
    );
  }
  
  return (
    <div className={`bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 ${className}`}>
      {translatedError}
    </div>
  );
};
