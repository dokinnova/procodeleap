
interface ErrorMessageProps {
  error: string | null;
  success?: string | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, success, className = '' }) => {
  if (!error && !success) return null;
  
  if (success) {
    return (
      <div className={`bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4 ${className}`}>
        {success}
      </div>
    );
  }
  
  return (
    <div className={`bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 ${className}`}>
      {error}
    </div>
  );
};
