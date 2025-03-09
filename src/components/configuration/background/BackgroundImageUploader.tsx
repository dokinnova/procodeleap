
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackgroundImageUploaderProps {
  currentImage?: string | null;
  backgroundColor?: string | null;
}

export const BackgroundImageUploader = ({ 
  currentImage, 
  backgroundColor 
}: BackgroundImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const queryClient = useQueryClient();

  const updateBackgroundMutation = useMutation({
    mutationFn: async (data: { 
      background_type: "image", 
      background_color?: string, 
      background_image?: string 
    }) => {
      const { error } = await supabase
        .from("site_settings")
        .update(data)
        .eq("id", 1);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Fondo actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (error) => {
      toast.error("Error al actualizar el fondo: " + error.message);
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadSuccess(false);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `background_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("backgrounds")
        .getPublicUrl(filePath);

      updateBackgroundMutation.mutate({
        background_type: "image",
        background_image: publicUrl,
        background_color: backgroundColor || undefined
      });
      
      setUploadSuccess(true);
    } catch (error: any) {
      toast.error("Error al subir la imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="border rounded-md p-2 bg-background/50">
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Fondo actual" 
              className="w-full h-40 object-cover rounded"
            />
            <div className="absolute top-2 right-2 bg-background/80 text-success px-2 py-1 text-xs rounded-full">
              Imagen actual
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Imagen de fondo actual
          </p>
        </div>
      )}

      <div className="border rounded-md p-4 bg-background">
        <Button asChild variant="outline" className="w-full flex items-center gap-2">
          <label className="cursor-pointer flex items-center justify-center gap-2 h-full w-full">
            {uploadSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : uploadSuccess ? "¡Imagen subida exitosamente!" : "Subir imagen de fondo"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        
        <p className="text-sm text-muted-foreground mt-3">
          Recomendado: imagen de 1920x1080 pixeles o superior
        </p>
        
        {uploadSuccess && (
          <div className="mt-3 text-center text-sm text-green-600 flex items-center justify-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>La imagen se ha subido correctamente y se está utilizando como fondo</span>
          </div>
        )}
      </div>
    </div>
  );
};
