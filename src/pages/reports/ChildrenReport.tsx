import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ChildrenReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: children = [], isLoading, error, refetch } = useQuery({
    queryKey: ['children-report'],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de niños para reporte...');
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.error('No hay sesión activa');
          throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        }

        const { data, error } = await supabase
          .from('children')
          .select('*, schools(name)')
          .order('name');

        if (error) {
          console.error('Error al obtener niños:', error);
          throw error;
        }

        if (!data) {
          console.log('No se encontraron niños');
          return [];
        }

        console.log('Niños obtenidos exitosamente:', data.length, 'registros');
        return data as Child[];
      } catch (error: any) {
        console.error('Error en la consulta de niños:', error);
        toast({
          title: "Error al cargar los datos",
          description: error.message || "Por favor, verifica tu conexión e intenta nuevamente",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChildClick = (child: Child) => {
    console.log('Navegando a detalles del niño:', child.id);
    navigate('/children', { state: { selectedChild: child } });
  };

  if (isLoading) {
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
  }

  if (error) {
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
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Niños</CardTitle>
          <CardDescription>
            Listado completo de niños registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escuela
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChildren.map((child) => (
                    <tr 
                      key={child.id}
                      onClick={() => handleChildClick(child)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{child.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{child.age} años</td>
                      <td className="px-6 py-4 whitespace-nowrap">{child.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {child.schools?.name || 'No asignada'}
                      </td>
                    </tr>
                  ))}
                  {filteredChildren.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No se encontraron niños
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildrenReport;