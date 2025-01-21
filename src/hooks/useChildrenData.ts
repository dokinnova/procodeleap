import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";

export const useChildrenData = () => {
  return useQuery({
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
          throw new Error(`Error al obtener datos: ${error.message}`);
        }
        
        if (!data) {
          console.log('No children data found');
          return [];
        }
        
        console.log('Children data fetched successfully:', data);
        return data as Child[];
      } catch (error) {
        console.error('Error in query function:', error);
        if (error instanceof Error) {
          throw new Error(`Error de conexión: ${error.message}`);
        }
        throw new Error('Error desconocido al obtener los datos');
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};