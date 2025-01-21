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
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};