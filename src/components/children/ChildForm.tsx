import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChildFormFields } from "./form/ChildFormFields";
import { Child } from "@/types";
import { useChildForm } from "@/hooks/useChildForm";
import { useToast } from "@/hooks/use-toast";

interface ChildFormProps {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
}

export const ChildForm = ({ selectedChild, setSelectedChild }: ChildFormProps) => {
  const { formData, handleInputChange, handleSubmit } = useChildForm(selectedChild, setSelectedChild);
  const { toast } = useToast();

  const { data: schools = [], isError, isLoading, refetch } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de escuelas...');
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error al obtener escuelas:', error);
          throw error;
        }

        if (!data) {
          console.log('No se encontraron escuelas');
          return [];
        }

        console.log('Escuelas obtenidas exitosamente:', data);
        return data;
      } catch (error) {
        console.error('Error en la consulta de escuelas:', error);
        toast({
          title: "Error al cargar las escuelas",
          description: "Por favor, intenta nuevamente",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (isLoading) {
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
  }

  if (isError) {
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
            onClick={() => refetch()}
            variant="outline"
            className="w-full"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedChild ? 'Editar Niño' : 'Registrar Nuevo Niño'}
        </CardTitle>
        <CardDescription>
          {selectedChild 
            ? 'Modifica los datos del niño seleccionado' 
            : 'Ingresa los datos para registrar un nuevo niño'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ChildFormFields
            formData={formData}
            schools={schools}
            onInputChange={handleInputChange}
          />

          <div className="flex justify-end gap-2">
            {selectedChild && (
              <Button variant="outline" onClick={() => setSelectedChild(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {selectedChild ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};