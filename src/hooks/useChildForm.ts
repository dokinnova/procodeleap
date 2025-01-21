import { useState } from "react";
import { Child } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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
      if (selectedChild) {
        console.log('Updating existing child:', selectedChild.id);
        const { error } = await supabase
          .from("children")
          .update(formData)
          .eq("id", selectedChild.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Niño actualizado correctamente",
        });
        setSelectedChild(null);
      } else {
        console.log('Creating new child');
        const { error } = await supabase.from("children").insert([formData]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Niño registrado correctamente",
        });
      }

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
    } catch (error) {
      console.error('Error in form submission:', error);
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