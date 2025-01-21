import { useState, useEffect } from "react";
import { Baby, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChildForm } from "@/components/children/ChildForm";
import { ChildrenTable } from "@/components/children/ChildrenTable";
import { PrintableChildrenList } from "@/components/children/PrintableChildrenList";
import { Child } from "@/types";
import { useLocation } from "react-router-dom";

const Children = () => {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedChild) {
      console.log('Setting selected child from navigation:', location.state.selectedChild);
      setSelectedChild(location.state.selectedChild);
      // Limpiar el estado de navegación para evitar problemas al recargar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      try {
        console.log('Fetching children data...');
        const { data, error } = await supabase
          .from('children')
          .select('*, schools(name)')
          .order('name');
        
        if (error) {
          console.error('Error fetching children:', error);
          toast({
            title: "Error al cargar los datos",
            description: "Por favor, intenta nuevamente en unos momentos",
            variant: "destructive",
          });
          throw error;
        }
        
        if (!data) {
          console.log('No children data found');
          return [];
        }
        
        console.log('Children data fetched successfully:', data);
        return data as Child[];
      } catch (error) {
        console.error('Error in query function:', error);
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impresión",
      description: "Se abrirá el diálogo de impresión automáticamente.",
    });
  };

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] print:hidden gap-4">
        <p className="text-lg text-red-500">Error al cargar los datos</p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] print:hidden">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Baby className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Niños Registrados</h1>
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Listado
        </Button>
      </div>

      <div className="print:hidden">
        <ChildForm 
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
        />

        <ChildrenTable 
          children={children}
          search={search}
          setSearch={setSearch}
          setSelectedChild={setSelectedChild}
        />
      </div>

      <PrintableChildrenList children={children} />
    </div>
  );
};

export default Children;