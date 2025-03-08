
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CHILDREN_QUERY_KEY } from "../useChildrenData";
import { Child } from "@/types";
import { ChildFormData } from "../useChildForm";
import { useUserPermissions } from "../useUserPermissions";

export const useFormSubmission = (
  formData: ChildFormData,
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canCreate, canEdit } = useUserPermissions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión para realizar esta acción",
          variant: "destructive",
        });
        return;
      }

      if (selectedChild && !canEdit) {
        toast({
          title: "Permiso denegado",
          description: "No tienes permisos para editar niños",
          variant: "destructive",
        });
        return;
      } else if (!selectedChild && !canCreate) {
        toast({
          title: "Permiso denegado",
          description: "No tienes permisos para crear niños",
          variant: "destructive",
        });
        return;
      }

      if (!formData.name || !formData.birth_date || !formData.location) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = {
        ...formData,
        school_id: formData.school_id || null,
        story: formData.story || null,
        grade: formData.grade || null,
        priority: formData.priority || null
      };

      if (selectedChild) {
        console.log('Updating existing child:', selectedChild.id);
        const { data, error } = await supabase
          .from("children")
          .update(dataToSave)
          .eq("id", selectedChild.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating child:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Niño actualizado correctamente",
        });
        
        if (data) {
          console.log('Setting updated child data:', data);
          setSelectedChild({
            ...data,
            birth_date: data.birth_date || '',
            story: data.story || '',
            school_id: data.school_id || '',
            grade: data.grade || '',
            image_url: data.image_url || null,
            status: data.status || 'pending',
            priority: (data.priority as 'high' | 'medium' | 'low' | null) || null
          });
        }
      } else {
        console.log('Creating new child');
        const { data, error } = await supabase
          .from("children")
          .insert([dataToSave])
          .select('*')
          .single();

        if (error) {
          console.error('Error creating child:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Niño registrado correctamente",
        });
      }

      console.log('Invalidating children queries');
      
      await queryClient.invalidateQueries({ 
        queryKey: [CHILDREN_QUERY_KEY],
        refetchType: 'all' 
      });
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};
