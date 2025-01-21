import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInYears, parseISO } from "date-fns";

interface PersonalInfoFieldsProps {
  name: string;
  birthDate: string;
  age: number;
  location: string;
  onInputChange: (field: string, value: any) => void;
}

export const PersonalInfoFields = ({ 
  name, 
  birthDate, 
  age, 
  location, 
  onInputChange 
}: PersonalInfoFieldsProps) => {
  const handleBirthDateChange = (value: string) => {
    onInputChange('birth_date', value);
    if (value) {
      const birthDate = parseISO(value);
      const age = differenceInYears(new Date(), birthDate);
      onInputChange('age', age);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          placeholder="Nombre del niño"
          value={name}
          onChange={(e) => onInputChange('name', e.target.value)}
          required
        />
      </div>
      
      <div className="flex gap-4 items-start">
        <div className="space-y-2 flex-1">
          <Label htmlFor="birth_date">Fecha de nacimiento</Label>
          <Input
            id="birth_date"
            type="date"
            value={birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 w-24">
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            value={age}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          placeholder="Ubicación"
          value={location}
          onChange={(e) => onInputChange('location', e.target.value)}
          required
        />
      </div>
    </>
  );
};