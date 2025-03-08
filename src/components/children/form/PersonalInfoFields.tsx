
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChildFormData } from "@/hooks/useChildForm";
import { useEffect } from "react";

interface PersonalInfoFieldsProps {
  name: string;
  birthDate: string;
  age: number;
  location: string;
  grade: string;
  onInputChange: (field: keyof ChildFormData, value: any) => void;
  readOnly?: boolean;
}

export const PersonalInfoFields = ({
  name,
  birthDate,
  age,
  location,
  grade,
  onInputChange,
  readOnly = false
}: PersonalInfoFieldsProps) => {
  // Calculate age when birth date changes
  useEffect(() => {
    if (birthDate) {
      const birthdateDate = new Date(birthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthdateDate.getFullYear();
      const monthDiff = today.getMonth() - birthdateDate.getMonth();
      
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
        calculatedAge--;
      }
      
      // Only update if the calculated age is different and valid
      if (calculatedAge >= 0 && calculatedAge !== age) {
        onInputChange('age', calculatedAge);
      }
    }
  }, [birthDate, age, onInputChange]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Nombre completo"
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
        <Input
          id="birth_date"
          type="date"
          value={birthDate}
          onChange={(e) => onInputChange('birth_date', e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Edad</Label>
        <Input
          id="age"
          type="number"
          value={age}
          onChange={(e) => onInputChange('age', parseInt(e.target.value))}
          placeholder="Edad"
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="Ciudad o localidad"
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="grade">Datos de estudio</Label>
        <Input
          id="grade"
          value={grade}
          onChange={(e) => onInputChange('grade', e.target.value)}
          placeholder="Curso escolar actual"
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100" : ""}
        />
      </div>
    </div>
  );
};
