
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CHILDREN_QUERY_KEY } from "@/hooks/useChildrenData";
import generatePdf from "react-to-pdf";

const ChildrenReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: children = [], isLoading, error, refetch } = useQuery({
    queryKey: [CHILDREN_QUERY_KEY, 'report'],
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

  const handleGeneratePdf = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const options = {
      filename: `reporte-ninos-${new Date().toISOString().split('T')[0]}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
      overrides: {
        pdf: {
          compress: true
        },
        canvas: {
          useCORS: true
        }
      }
    };

    try {
      const targetElement = document.getElementById('children-report-printable');
      if (targetElement) {
        await generatePdf(() => targetElement, options);
        toast({
          title: "PDF generado correctamente",
          description: "El documento se ha descargado",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reporte de Niños</CardTitle>
            <CardDescription>
              Listado completo de niños registrados en el sistema
            </CardDescription>
          </div>
          <Button onClick={handleGeneratePdf} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
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

      {/* Elemento oculto para impresión */}
      <div id="children-report-printable" className="hidden">
        <div className="p-8 max-w-[210mm] mx-auto bg-white">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte de Niños</h1>
            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 text-left font-bold">Nombre</th>
                <th className="py-2 text-left font-bold">Edad</th>
                <th className="py-2 text-left font-bold">Ubicación</th>
                <th className="py-2 text-left font-bold">Escuela</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child) => (
                <tr key={child.id} className="border-b border-gray-300">
                  <td className="py-2">{child.name}</td>
                  <td className="py-2">{child.age} años</td>
                  <td className="py-2">{child.location}</td>
                  <td className="py-2">{child.schools?.name || 'No asignada'}</td>
                </tr>
              ))}
              {filteredChildren.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No se encontraron niños
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="mt-8 text-xs text-gray-400 text-right">
            <p>Documento generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenReport;
