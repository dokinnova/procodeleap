import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  story: string | null;
  image_url: string | null;
  school_id: string | null;
}

export const useDeleteChild = () => {
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      // Invalidamos la caché y actualizamos la UI
      await queryClient.invalidateQueries({ queryKey: ["children"] });
      
      toast.success('Niño eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el niño');
    } finally {
      setChildToDelete(null);
    }
  };

  return {
    childToDelete,
    setChildToDelete,
    handleDelete,
  };
};