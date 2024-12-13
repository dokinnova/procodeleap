import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/types";
import { PhotoUpload } from "../PhotoUpload";
import { differenceInYears, parseISO } from "date-fns";

interface ChildFormData {
  name: string;
  age: number;
  birth_date: string;
  location: string;
  story: string;
  school_id: string;
  image_url: string | null;
}

interface ChildFormFieldsProps {
  formData: ChildFormData;
  schools: School[];
  onInputChange: (field: keyof ChildFormData, value: any) => void;
}

export const ChildFormFields = ({ formData, schools, onInputChange }: ChildFormFieldsProps) => {
  const handleBirthDateChange = (value: string) => {
    onInputChange('birth_date', value);
    // Calculate age automatically when birth date changes
    if (value) {
      const birthDate = parseISO(value);
      const age = differenceInYears(new Date(), birthDate);
      onInputChange('age', age);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <Label>Foto</Label>
        <div className="mt-2">
          <PhotoUpload
            currentPhotoUrl={formData.image_url}
            onPhotoUploaded={(url) => onInputChange('image_url', url)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          placeholder="Nombre del niño"
          value={formData.name}
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
            value={formData.birth_date}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 w-24">
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
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
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">Colegio</Label>
        <Select 
          value={formData.school_id} 
          onValueChange={(value) => onInputChange('school_id', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecciona un colegio" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="story">Historia</Label>
        <Input
          id="story"
          placeholder="Historia del niño"
          value={formData.story}
          onChange={(e) => onInputChange('story', e.target.value)}
        />
      </div>
    </div>
  );
};