
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const CHILDREN_REPORT_QUERY_KEY = 'children-report';

export const useChildrenReport = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: [CHILDREN_REPORT_QUERY_KEY],
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

        // Make sure each child has the priority field
        const childrenWithPriority = data.map(child => ({
          ...child,
          priority: child.priority || null
        }));

        console.log('Niños obtenidos exitosamente:', childrenWithPriority.length, 'registros');
        return childrenWithPriority as Child[];
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
};
