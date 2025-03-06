
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
    <div className="space-y-3">
      <Label>Foto</Label>
      <div className="flex flex-col items-center justify-center h-[200px]">
        {readOnly ? (
          <Avatar className="h-32 w-32">
            <AvatarImage src={currentPhotoUrl || ''} alt="Foto del niño" />
            <AvatarFallback>Sin foto</AvatarFallback>
          </Avatar>
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
