
interface ErrorMessageProps {
  error: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
      {error}
    </div>
  );
};
