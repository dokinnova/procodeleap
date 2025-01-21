import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChildrenErrorProps {
  error: Error;
  onRetry: () => void;
}

export const ChildrenError = ({ error, onRetry }: ChildrenErrorProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] print:hidden gap-4 px-4">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar los datos</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message}
          <br />
          <span className="text-sm opacity-75">
            Por favor, verifica tu conexión a internet e inténtalo de nuevo.
          </span>
        </AlertDescription>
      </Alert>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Reintentar
      </Button>
    </div>
  );
};