import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChildFormErrorProps {
  onRetry: () => void;
}

export const ChildFormError = ({ onRetry }: ChildFormErrorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>
          No se pudieron cargar los datos. Por favor, intenta nuevamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-red-500">
          Hubo un problema al conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.
        </p>
        <Button 
          onClick={onRetry}
          variant="outline"
          className="w-full"
        >
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
};