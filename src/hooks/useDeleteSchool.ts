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
      console.log("Iniciando proceso de eliminación para el colegio:", schoolId);
      
      // Primero verificamos si hay niños asociados
      const { data: children, error: checkError } = await supabase
        .from('children')
        .select('id')
        .eq('school_id', schoolId);

      if (checkError) {
        console.error('Error al verificar niños asociados:', checkError);
        throw checkError;
      }

      if (children && children.length > 0) {
        console.log('No se puede eliminar: hay niños asociados', children.length);
        toast.error('No se puede eliminar el colegio porque tiene niños asociados');
        setSchoolToDelete(null);
        return;
      }

      // Procedemos con la eliminación
      console.log('Ejecutando eliminación en Supabase...');
      const { error: deleteError, data } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId)
        .select();

      if (deleteError) {
        console.error('Error en la eliminación:', deleteError);
        throw deleteError;
      }

      console.log('Respuesta de eliminación:', data);

      // Invalidamos la caché y actualizamos la UI
      await queryClient.invalidateQueries({ queryKey: ["schools"] });
      console.log('Cache invalidada');
      
      toast.success('Colegio eliminado exitosamente');
      setSchoolToDelete(null);
    } catch (error) {
      console.error('Error en el proceso de eliminación:', error);
      toast.error('Error al eliminar el colegio');
    }
  };

  return {
    schoolToDelete,
    setSchoolToDelete,
    handleDelete,
  };
};