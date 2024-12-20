import { useState } from "react";
import { Baby, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChildForm } from "@/components/children/ChildForm";
import { ChildrenTable } from "@/components/children/ChildrenTable";
import { PrintableChildrenList } from "@/components/children/PrintableChildrenList";
import { Child } from "@/types";

const Children = () => {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const { toast } = useToast();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching children:', error);
        throw error;
      }
      
      return data as Child[];
    }
  });

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impresión",
      description: "Se abrirá el diálogo de impresión automáticamente.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] print:hidden">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4 print:hidden">
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