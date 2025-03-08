
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School } from "@/types";

interface UseSchoolsQueryResult {
  schools: School[];
  isLoading: boolean;
  error: unknown;
}

export const useSchoolsQuery = (): UseSchoolsQueryResult => {
  const { data, isLoading, error } = useQuery({
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
      // Transform the data to match the School interface if needed
      return data.map((school: any) => ({
        id: school.id,
        name: school.name,
        location: school.address || '', // Use address as location if needed
        phone: school.phone || '',
        email: school.email || '',
        address: school.address
      }));
    }
  });

  return {
    schools: (data as School[]) || [],
    isLoading,
    error
  };
};
