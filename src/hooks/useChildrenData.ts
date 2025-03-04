
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const CHILDREN_QUERY_KEY = 'children'; // Consistent query key to be used across components

export const useChildrenData = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: [CHILDREN_QUERY_KEY],
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
            description: error.message,
            variant: "destructive",
          });
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
        toast({
          title: "Error de conexión",
          description: "Por favor, verifica tu conexión e intenta nuevamente",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
    staleTime: 1000 * 60 * 5, // 5 minutes - reduced stale time to ensure more frequent refetches
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
