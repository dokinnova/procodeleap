import { useState } from "react";
import { Upload } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface LogoUploaderProps {
  currentLogo?: string | null;
}

export const LogoUploader = ({ currentLogo }: LogoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateLogoMutation = useMutation({
    mutationFn: async (logoUrl: string) => {
      const { data, error } = await supabase
        .from("site_settings")
        .update({ logo_url: logoUrl })
        .eq("id", 1);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Logo actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (error) => {
      toast.error("Error al actualizar el logo: " + error.message);
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      await updateLogoMutation.mutateAsync(publicUrl);
    } catch (error: any) {
      toast.error("Error al subir el logo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentLogo && (
        <div className="w-32 h-32">
          <img
            src={currentLogo}
            alt="Logo actual"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div>
        <Button asChild disabled={uploading}>
          <label className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Subiendo..." : "Subir nuevo logo"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
      </div>
    </div>
  );
};