
import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TypeSelector } from "./background/TypeSelector";
import { ColorPickerSettings } from "./background/ColorPickerSettings";
import { BackgroundImageUploader } from "./background/BackgroundImageUploader";

export const BackgroundSettings = () => {
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");
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
    }
  }, [settings]);

  const updateBackgroundTypeMutation = useMutation({
    mutationFn: async (type: "color" | "image") => {
      const { error } = await supabase
        .from("site_settings")
        .update({ background_type: type })
        .eq("id", 1);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const handleTypeChange = (value: "color" | "image") => {
    setBackgroundType(value);
    updateBackgroundTypeMutation.mutate(value);
  };

  return (
    <div className="space-y-6">
      <TypeSelector value={backgroundType} onChange={handleTypeChange} />

      <Tabs value={backgroundType} className="w-full">
        <TabsContent value="color" className="space-y-4">
          <ColorPickerSettings 
            initialColor={settings?.background_color || "#F4F8FC"} 
            backgroundImage={settings?.background_image} 
          />
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <BackgroundImageUploader 
            currentImage={settings?.background_image} 
            backgroundColor={settings?.background_color} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
