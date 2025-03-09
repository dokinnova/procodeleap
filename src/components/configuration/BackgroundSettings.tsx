
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ImageIcon, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

export const BackgroundSettings = () => {
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");
  const [backgroundColor, setBackgroundColor] = useState("#F4F8FC");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current background settings
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      // Ensure type safety by checking if background_type is either "color" or "image" 
      const bgType = settings.background_type === "color" || settings.background_type === "image" 
        ? settings.background_type 
        : "color"; // Default to "color" if invalid value
      
      setBackgroundType(bgType as "color" | "image");
      setBackgroundColor(settings.background_color || "#F4F8FC");
    }
  }, [settings]);

  const updateBackgroundMutation = useMutation({
    mutationFn: async (data: { 
      background_type: "color" | "image", 
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

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  };

  const handleColorSave = () => {
    updateBackgroundMutation.mutate({
      background_type: "color",
      background_color: backgroundColor,
      background_image: settings?.background_image
    });
  };

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
        background_color: backgroundColor
      });
      
      setUploadSuccess(true);
    } catch (error: any) {
      toast.error("Error al subir la imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTypeChange = (value: "color" | "image") => {
    setBackgroundType(value);
    updateBackgroundMutation.mutate({
      background_type: value,
      background_color: backgroundColor,
      background_image: settings?.background_image
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tipo de Fondo</h3>
        <RadioGroup 
          value={backgroundType} 
          onValueChange={(v) => handleTypeChange(v as "color" | "image")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="color" id="color" />
            <Label htmlFor="color">Color Sólido</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image">Imagen</Label>
          </div>
        </RadioGroup>
      </div>

      <Tabs value={backgroundType} className="w-full">
        <TabsContent value="color" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="color-picker">Color de Fondo</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="color-picker"
                type="color"
                value={backgroundColor}
                onChange={handleColorChange}
                className="w-20 h-10 p-1"
              />
              <div 
                className="w-12 h-10 rounded border"
                style={{ backgroundColor }}
              />
              <span className="text-sm font-mono">{backgroundColor}</span>
            </div>
            <Button 
              onClick={handleColorSave} 
              className="mt-2 w-full sm:w-auto"
              disabled={updateBackgroundMutation.isPending}
            >
              Guardar Color
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="space-y-4">
            {settings?.background_image && (
              <div className="border rounded-md p-2 bg-background/50">
                <div className="relative">
                  <img 
                    src={settings.background_image} 
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
