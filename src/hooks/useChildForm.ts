
import { Child } from "@/types";
import { useChildFormState } from "./child-form/useChildFormState";
import { useFormInputHandlers } from "./child-form/useFormInputHandlers";
import { useFormSubmission } from "./child-form/useFormSubmission";

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
  priority: 'high' | 'medium' | 'low' | null;
}

export const useChildForm = (
  selectedChild: Child | null,
  setSelectedChild: (child: Child | null) => void
) => {
  const { formData, setFormData } = useChildFormState(selectedChild);
  const { handleInputChange } = useFormInputHandlers(setFormData);
  const { handleSubmit } = useFormSubmission(formData, selectedChild, setSelectedChild);

  return {
    formData,
    handleInputChange,
    handleSubmit,
  };
};
