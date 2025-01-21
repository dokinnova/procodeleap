import { Label } from "@/components/ui/label";
import { PhotoUpload } from "../PhotoUpload";

interface PhotoFieldProps {
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string) => void;
}

export const PhotoField = ({ currentPhotoUrl, onPhotoUploaded }: PhotoFieldProps) => {
  return (
    <div className="md:col-span-2">
      <Label>Foto</Label>
      <div className="mt-2">
        <PhotoUpload
          currentPhotoUrl={currentPhotoUrl}
          onPhotoUploaded={onPhotoUploaded}
        />
      </div>
    </div>
  );
};