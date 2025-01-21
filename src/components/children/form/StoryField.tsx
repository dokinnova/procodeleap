import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoryFieldProps {
  story: string;
  onInputChange: (field: string, value: string) => void;
}

export const StoryField = ({ story, onInputChange }: StoryFieldProps) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="story">Historia</Label>
      <Input
        id="story"
        placeholder="Historia del niño"
        value={story}
        onChange={(e) => onInputChange('story', e.target.value)}
      />
    </div>
  );
};