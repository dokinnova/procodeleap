import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Child } from "@/types";
import { ChildFormData } from "@/types/form";

export const useFormInitialization = (selectedChild: Child | null) => {
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    age: 0,
    birth_date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    story: '',
    school_id: '',
    image_url: null,
    status: 'pending',
    grade: '',
  });

  useEffect(() => {
    if (selectedChild) {
      console.log('Actualizando formulario con niño seleccionado:', selectedChild);
      setFormData({
        name: selectedChild.name || '',
        age: selectedChild.age || 0,
        birth_date: selectedChild.birth_date || format(new Date(), 'yyyy-MM-dd'),
        location: selectedChild.location || '',
        story: selectedChild.story || '',
        school_id: selectedChild.school_id || '',
        image_url: selectedChild.image_url,
        status: selectedChild.status || 'pending',
        grade: selectedChild.grade || '',
      });
    } else {
      console.log('Reseteando formulario a valores iniciales');
      setFormData({
        name: '',
        age: 0,
        birth_date: format(new Date(), 'yyyy-MM-dd'),
        location: '',
        story: '',
        school_id: '',
        image_url: null,
        status: 'pending',
        grade: '',
      });
    }
  }, [selectedChild]);

  return { formData, setFormData };
};