
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBusinessIntelligenceData = () => {
  const { toast } = useToast();

  // Consulta para obtener los datos de los niños
  const { 
    data: childrenData, 
    isLoading: childrenLoading 
  } = useQuery({
    queryKey: ["bi-children"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("children")
          .select("status, school_id, schools(name)")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de niños",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Consulta para obtener los datos de los padrinos
  const { 
    data: sponsorsData, 
    isLoading: sponsorsLoading 
  } = useQuery({
    queryKey: ["bi-sponsors"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("status, contribution, created_at")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de padrinos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Consulta para obtener datos de apadrinamientos
  const { 
    data: sponsorshipsData, 
    isLoading: sponsorshipsLoading 
  } = useQuery({
    queryKey: ["bi-sponsorships"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sponsorships")
          .select("*")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de apadrinamientos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const isLoading = childrenLoading || sponsorsLoading || sponsorshipsLoading;

  return {
    childrenData,
    sponsorsData,
    sponsorshipsData,
    isLoading
  };
};
