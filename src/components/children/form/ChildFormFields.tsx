import { School } from "@/types";
import { ChildFormData } from "@/hooks/useChildForm";
import { PhotoField } from "./PhotoField";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { StatusAndSchoolFields } from "./StatusAndSchoolFields";
import { StoryField } from "./StoryField";

interface ChildFormFieldsProps {
  formData: ChildFormData;
  schools: School[];
  onInputChange: (field: keyof ChildFormData, value: any) => void;
}

export const ChildFormFields = ({ formData, schools, onInputChange }: ChildFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <PhotoField
          currentPhotoUrl={formData.image_url}
          onPhotoUploaded={(url) => onInputChange('image_url', url)}
        />
        
        <StatusAndSchoolFields
          status={formData.status}
          schoolId={formData.school_id}
          schools={schools}
          onInputChange={onInputChange}
        />
      </div>

      <div className="space-y-6">
        <PersonalInfoFields
          name={formData.name}
          birthDate={formData.birth_date}
          age={formData.age}
          location={formData.location}
          grade={formData.grade || ''}
          onInputChange={onInputChange}
        />

        <StoryField
          story={formData.story}
          onInputChange={onInputChange}
        />
      </div>
    </div>
  );
};