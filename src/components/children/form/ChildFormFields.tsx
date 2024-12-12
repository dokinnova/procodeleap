import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/types";
import { PhotoUpload } from "../PhotoUpload";

interface ChildFormData {
  name: string;
  age: number;
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
  return (
    <>
      <div className="space-y-2">
        <Label>Foto</Label>
        <PhotoUpload
          currentPhotoUrl={formData.image_url}
          onPhotoUploaded={(url) => onInputChange('image_url', url)}
        />
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
      
      <div className="space-y-2">
        <Label htmlFor="age">Edad</Label>
        <Input
          id="age"
          type="number"
          placeholder="Edad"
          value={formData.age}
          onChange={(e) => onInputChange('age', parseInt(e.target.value) || 0)}
          className="w-20"
          min="0"
          max="999"
          required
        />
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
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="story">Historia</Label>
        <Input
          id="story"
          placeholder="Historia del niño"
          value={formData.story}
          onChange={(e) => onInputChange('story', e.target.value)}
        />
      </div>
    </>
  );
};