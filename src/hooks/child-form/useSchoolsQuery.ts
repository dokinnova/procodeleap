
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School } from "@/types";

export const useSchoolsQuery = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data: schoolsData, error } = await supabase
        .from("schools")
        .select("*");

      if (error) {
        throw new Error(`Error fetching schools: ${error.message}`);
      }

      return schoolsData || [];
    },
    select: (data) => {
      // Transform the data to match the School interface
      return data.map((school: any) => ({
        id: school.id,
        name: school.name,
        location: school.address || '', // Use address as location
        phone: school.phone || '',
        email: school.email || '',
        address: school.address || ''
      }));
    }
  });

  return {
    schools: (data as School[]) || [],
    isLoading,
    isError,
    error,
    refetch
  };
};
