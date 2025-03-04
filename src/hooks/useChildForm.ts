
import { useState } from "react";
import { Child } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CHILDREN_QUERY_KEY } from "./useChildrenData";

export interface ChildFormData {
  name: string;
  birth_date: string;
  age: number;
  location: string;
  story: string;
  school_id: string;
  grade: string;
  image_url: string | null;
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
}

export const useChildForm = (
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void
) => {
  const [formData, setFormData] = useState<ChildFormData>({
    name: selectedChild?.name || "",
    birth_date: selectedChild?.birth_date || "",
    age: selectedChild?.age || 0,
    location: selectedChild?.location || "",
    story: selectedChild?.story || "",
    school_id: selectedChild?.school_id || "",
    grade: selectedChild?.grade || "",
    image_url: selectedChild?.image_url || null,
    status: selectedChild?.status || "pending",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleInputChange = (field: keyof ChildFormData, value: any) => {
    console.log('Actualizando campo:', field, 'con valor:', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

      // Validar campos requeridos
      if (!formData.name || !formData.birth_date || !formData.location) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }

      // Preparar los datos para la inserción/actualización
      const dataToSave = {
        ...formData,
        school_id: formData.school_id || null,
        story: formData.story || null,
        grade: formData.grade || null
      };

      if (selectedChild) {
        console.log('Updating existing child:', selectedChild.id);
        const { error } = await supabase
          .from("children")
          .update(dataToSave)
          .eq("id", selectedChild.id);

        if (error) {
          console.error('Error updating child:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Niño actualizado correctamente",
        });
        setSelectedChild(null);
      } else {
        console.log('Creating new child');
        const { error } = await supabase
          .from("children")
          .insert([dataToSave]);

        if (error) {
          console.error('Error creating child:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Niño registrado correctamente",
        });
      }

      // Invalidate and refetch queries
      console.log('Invalidating children queries');
      queryClient.invalidateQueries({ queryKey: [CHILDREN_QUERY_KEY] });

      setFormData({
        name: "",
        birth_date: "",
        age: 0,
        location: "",
        story: "",
        school_id: "",
        grade: "",
        image_url: null,
        status: "pending",
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

  return {
    formData,
    handleInputChange,
    handleSubmit,
  };
};
