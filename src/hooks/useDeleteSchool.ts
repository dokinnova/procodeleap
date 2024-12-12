import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { School } from "@/types";

export const useDeleteSchool = () => {
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (schoolId: string) => {
    try {
      // Verificamos si hay niños asociados
      const { data: children, error: checkError } = await supabase
        .from('children')
        .select('id')
        .eq('school_id', schoolId);

      if (checkError) throw checkError;

      if (children && children.length > 0) {
        toast.error('No se puede eliminar el colegio porque tiene niños asociados');
        setSchoolToDelete(null);
        return;
      }

      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (deleteError) throw deleteError;

      await queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success('Colegio eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el colegio');
    } finally {
      setSchoolToDelete(null);
    }
  };

  return {
    schoolToDelete,
    setSchoolToDelete,
    handleDelete,
  };
};