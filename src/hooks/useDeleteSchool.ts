import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { School } from "@/pages/Schools";

export const useDeleteSchool = () => {
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (schoolId: string) => {
    try {
      console.log("Attempting to delete school with ID:", schoolId);
      
      const { data: children, error: checkError } = await supabase
        .from('children')
        .select('id')
        .eq('school_id', schoolId);

      if (checkError) {
        console.error('Error checking children:', checkError);
        throw checkError;
      }

      if (children && children.length > 0) {
        toast.error('No se puede eliminar el colegio porque tiene niños asociados');
        setSchoolToDelete(null);
        return;
      }

      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (deleteError) {
        console.error('Error deleting school:', deleteError);
        throw deleteError;
      }

      await queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success('Colegio eliminado exitosamente');
      setSchoolToDelete(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el colegio');
    }
  };

  return {
    schoolToDelete,
    setSchoolToDelete,
    handleDelete,
  };
};