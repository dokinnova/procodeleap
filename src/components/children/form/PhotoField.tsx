
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "../PhotoUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PhotoFieldProps {
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string) => void;
  readOnly?: boolean;
}

export const PhotoField = ({ currentPhotoUrl, onPhotoUploaded, readOnly = false }: PhotoFieldProps) => {
  return (
    <div className="md:col-span-2">
      <Label>Foto</Label>
      <div className="mt-2">
        {readOnly ? (
          <div className="flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentPhotoUrl || ''} alt="Foto del niño" />
              <AvatarFallback>Sin foto</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <PhotoUpload
            currentPhotoUrl={currentPhotoUrl}
            onPhotoUploaded={onPhotoUploaded}
          />
        )}
      </div>
    </div>
  );
};
