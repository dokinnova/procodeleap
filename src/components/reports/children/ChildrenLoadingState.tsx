
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ChildrenLoadingState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargando...</CardTitle>
        <CardDescription>
          Obteniendo datos del reporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
};
