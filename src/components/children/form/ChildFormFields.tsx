
import { School } from "@/types";
import { ChildFormData } from "@/hooks/useChildForm";
import { PhotoField } from "./PhotoField";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { StatusAndSchoolFields } from "./StatusAndSchoolFields";
import { StoryField } from "./StoryField";
import { PriorityField } from "./PriorityField";

interface ChildFormFieldsProps {
  formData: ChildFormData;
  schools: School[];
  onInputChange: (field: keyof ChildFormData, value: any) => void;
  readOnly?: boolean;
}

export const ChildFormFields = ({ 
  formData, 
  schools, 
  onInputChange,
  readOnly = false 
}: ChildFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-[260px] flex flex-col">
          <PhotoField
            currentPhotoUrl={formData.image_url}
            onPhotoUploaded={(url) => onInputChange('image_url', url)}
            readOnly={readOnly}
          />
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <StatusAndSchoolFields
            status={formData.status}
            schoolId={formData.school_id}
            schools={schools}
            onInputChange={onInputChange}
            readOnly={readOnly}
          />
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <PriorityField
            priority={formData.priority}
            onInputChange={onInputChange}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="space-y-8 flex flex-col">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <PersonalInfoFields
            name={formData.name}
            birthDate={formData.birth_date}
            age={formData.age}
            location={formData.location}
            grade={formData.grade || ''}
            onInputChange={onInputChange}
            readOnly={readOnly}
          />
        </div>

        <div className="flex-grow bg-white p-5 rounded-lg shadow-sm border border-gray-100 max-h-[400px] flex flex-col">
          <StoryField
            story={formData.story}
            onInputChange={onInputChange}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
};
