import { Child } from "@/types";
import { ChildFormData } from "@/types/form";
import { useFormInitialization } from "./child-form/useFormInitialization";
import { useFormSubmission } from "./child-form/useFormSubmission";

export const useChildForm = (
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void
) => {
  const { formData, setFormData } = useFormInitialization(selectedChild);
  const { handleSubmit } = useFormSubmission(selectedChild, setSelectedChild, formData);

  const handleInputChange = (field: keyof ChildFormData, value: any) => {
    console.log('Actualizando campo:', field, 'con valor:', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
  };
};