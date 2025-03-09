
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ColorPickerSettingsProps {
  initialColor: string;
  backgroundImage?: string | null;
}

export const ColorPickerSettings = ({ initialColor, backgroundImage }: ColorPickerSettingsProps) => {
  const [backgroundColor, setBackgroundColor] = useState(initialColor);
  const queryClient = useQueryClient();

  const updateBackgroundMutation = useMutation({
    mutationFn: async (data: { 
      background_type: "color", 
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
      background_image: backgroundImage
    });
  };

  return (
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
  );
};
