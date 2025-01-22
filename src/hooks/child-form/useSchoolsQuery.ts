import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { School } from "@/types";

export const useSchoolsQuery = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de escuelas...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No hay sesión activa');
        }

        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name')
          .neq('name', '');
        
        if (error) {
          console.error('Error al obtener escuelas:', error);
          throw error;
        }

        if (!data) {
          console.log('No se encontraron escuelas');
          return [];
        }

        console.log('Escuelas obtenidas exitosamente:', data);
        return data as School[];
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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};