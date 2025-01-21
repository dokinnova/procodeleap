import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Child } from "@/types";
import { ChildFormData } from "@/types/form";

export const useFormSubmission = (
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void,
  formData: ChildFormData
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birth_date || !formData.location) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedChild) {
        const { error } = await supabase
          .from('children')
          .update({
            name: formData.name,
            age: formData.age,
            birth_date: formData.birth_date,
            location: formData.location,
            story: formData.story || null,
            school_id: formData.school_id || null,
            image_url: formData.image_url,
            status: formData.status,
            grade: formData.grade || null,
          })
          .eq('id', selectedChild.id);

        if (error) throw error;

        toast({
          title: "Niño actualizado",
          description: "Los datos se han actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('children')
          .insert([{
            name: formData.name,
            age: formData.age,
            birth_date: formData.birth_date,
            location: formData.location,
            story: formData.story || null,
            school_id: formData.school_id || null,
            image_url: formData.image_url,
            status: formData.status,
            grade: formData.grade || null,
          }]);

        if (error) throw error;

        toast({
          title: "Niño registrado",
          description: "El niño se ha registrado correctamente",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['children'] });
      
      if (selectedChild) {
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un error al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};