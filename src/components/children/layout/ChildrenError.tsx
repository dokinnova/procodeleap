import { Button } from "@/components/ui/button";

interface ChildrenErrorProps {
  error: Error;
  onRetry: () => void;
}

export const ChildrenError = ({ error, onRetry }: ChildrenErrorProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] print:hidden gap-4">
      <p className="text-lg text-red-500">Error al cargar los datos: {error.message}</p>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Reintentar
      </Button>
    </div>
  );
};