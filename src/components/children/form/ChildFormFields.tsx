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
      <PhotoField
        currentPhotoUrl={formData.image_url}
        onPhotoUploaded={(url) => onInputChange('image_url', url)}
      />

      <PersonalInfoFields
        name={formData.name}
        birthDate={formData.birth_date}
        age={formData.age}
        location={formData.location}
        onInputChange={onInputChange}
      />

      <StatusAndSchoolFields
        status={formData.status}
        schoolId={formData.school_id}
        schools={schools}
        onInputChange={onInputChange}
      />

      <StoryField
        story={formData.story}
        onInputChange={onInputChange}
      />
    </div>
  );
};