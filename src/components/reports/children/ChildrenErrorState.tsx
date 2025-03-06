
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ChildrenErrorStateProps {
  error: Error | unknown;
  refetch: () => void;
}

export const ChildrenErrorState = ({ error, refetch }: ChildrenErrorStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
        <CardDescription>
          No se pudieron cargar los datos del reporte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Hubo un problema al conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            console.log('Reintentando carga de datos...');
            refetch();
          }}
          variant="outline"
          className="w-full"
        >
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
};
