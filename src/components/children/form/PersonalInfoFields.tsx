import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChildFormData } from "@/hooks/useChildForm";

interface PersonalInfoFieldsProps {
  name: string;
  birthDate: string;
  age: number;
  location: string;
  grade: string;
  onInputChange: (field: keyof ChildFormData, value: any) => void;
}

export const PersonalInfoFields = ({
  name,
  birthDate,
  age,
  location,
  grade,
  onInputChange,
}: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Nombre completo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
        <Input
          id="birth_date"
          type="date"
          value={birthDate}
          onChange={(e) => onInputChange('birth_date', e.target.value)}
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="Ciudad o localidad"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Datos de estudio</Label>
        <Input
          id="grade"
          value={grade}
          onChange={(e) => onInputChange('grade', e.target.value)}
          placeholder="Curso escolar actual"
        />
      </div>
    </div>
  );
};