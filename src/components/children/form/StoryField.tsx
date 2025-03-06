
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoryFieldProps {
  story: string;
  onInputChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const StoryField = ({ story, onInputChange, readOnly = false }: StoryFieldProps) => {
  return (
    <div className="space-y-2 md:col-span-2 flex flex-col h-full">
      <Label htmlFor="story">Historia</Label>
      <Textarea
        id="story"
        placeholder="Historia del niño"
        value={story}
        onChange={(e) => onInputChange('story', e.target.value)}
        className={`min-h-[80px] flex-grow resize-none ${readOnly ? "bg-gray-100" : ""}`}
        readOnly={readOnly}
      />
    </div>
  );
};
