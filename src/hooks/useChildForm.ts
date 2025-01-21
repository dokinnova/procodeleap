import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types";
import { format } from "date-fns";

export interface ChildFormData {
  name: string;
  age: number;
  birth_date: string;
  location: string;
  story: string;
  school_id: string;
  image_url: string | null;
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
}

export const useChildForm = (
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    age: 0,
    birth_date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    story: '',
    school_id: '',
    image_url: null,
    status: 'pending',
  });

  useEffect(() => {
    if (selectedChild) {
      setFormData({
        name: selectedChild.name,
        age: selectedChild.age,
        birth_date: selectedChild.birth_date || format(new Date(), 'yyyy-MM-dd'),
        location: selectedChild.location,
        story: selectedChild.story || '',
        school_id: selectedChild.school_id || '',
        image_url: selectedChild.image_url,
        status: selectedChild.status,
      });
    } else {
      setFormData({
        name: '',
        age: 0,
        birth_date: format(new Date(), 'yyyy-MM-dd'),
        location: '',
        story: '',
        school_id: '',
        image_url: null,
        status: 'pending',
      });
    }
  }, [selectedChild]);

  const handleInputChange = (field: keyof ChildFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          }]);

        if (error) throw error;

        toast({
          title: "Niño registrado",
          description: "El niño se ha registrado correctamente",
        });

        setFormData({
          name: '',
          age: 0,
          birth_date: format(new Date(), 'yyyy-MM-dd'),
          location: '',
          story: '',
          school_id: '',
          image_url: null,
          status: 'pending',
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

  return {
    formData,
    handleInputChange,
    handleSubmit,
  };
};