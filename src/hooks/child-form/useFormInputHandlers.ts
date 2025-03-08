
import { ChildFormData } from "../useChildForm";

export const useFormInputHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ChildFormData>>
) => {
  const handleInputChange = (field: keyof ChildFormData, value: any) => {
    console.log('Actualizando campo:', field, 'con valor:', value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'birth_date' && value) {
      const birthdateDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthdateDate.getFullYear();
      const monthDiff = today.getMonth() - birthdateDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
        calculatedAge--;
      }
      
      if (calculatedAge >= 0) {
        setFormData(prev => ({
          ...prev,
          age: calculatedAge
        }));
      }
    }
  };

  return { handleInputChange };
};
