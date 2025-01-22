import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ChildFormLoading = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargando...</CardTitle>
        <CardDescription>
          Obteniendo datos del formulario
        </CardDescription>
      </CardHeader>
    </Card>
  );
};