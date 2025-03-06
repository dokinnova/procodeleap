
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string) => void;
}

export const PhotoUpload = ({ currentPhotoUrl, onPhotoUploaded }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe pesar más de 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('children')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('children')
          .getPublicUrl(data.path);

        onPhotoUploaded(publicUrl);

        toast({
          title: "Foto subida",
          description: "La foto se ha subido correctamente",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al subir la foto",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex justify-center w-full">
        {currentPhotoUrl ? (
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={currentPhotoUrl}
              alt="Foto del niño"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
          disabled={isUploading}
        />
        <label htmlFor="photo-upload">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {currentPhotoUrl ? 'Cambiar foto' : 'Subir foto'}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};
