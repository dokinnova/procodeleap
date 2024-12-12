import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sponsor } from "@/types";

export const useDeleteSponsor = () => {
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (sponsorId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsorId);

      if (deleteError) throw deleteError;

      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast.success('Padrino eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el padrino');
    } finally {
      setSponsorToDelete(null);
    }
  };

  return {
    sponsorToDelete,
    setSponsorToDelete,
    handleDelete,
  };
};