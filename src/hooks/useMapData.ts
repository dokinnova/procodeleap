
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child, Sponsor } from "@/types";

export const useMapData = () => {
  // Fetch children data
  const { 
    data: children, 
    isLoading: isLoadingChildren 
  } = useQuery({
    queryKey: ["children-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, name, location")
        .not("location", "is", null);
      
      if (error) throw error;
      return data as Child[];
    },
  });

  // Fetch sponsors data
  const { 
    data: sponsors, 
    isLoading: isLoadingSponsors 
  } = useQuery({
    queryKey: ["sponsors-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, name, city, country")
        .not("city", "is", null);
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  return {
    children,
    sponsors,
    isLoading: isLoadingChildren || isLoadingSponsors
  };
};
