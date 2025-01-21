import { Child } from "@/types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PrintableChildProfileProps {
  child: Child;
}

export const PrintableChildProfile = ({ child }: PrintableChildProfileProps) => {
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

  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">Ficha del Niño</h1>
          {settings?.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
          )}
        </div>

        <div className="flex items-start gap-6">
          {child.image_url && (
            <img
              src={child.image_url}
              alt={`Foto de ${child.name}`}
              className="w-48 h-48 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">ID:</p>
                <p className="font-medium">{child.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Nombre:</p>
                <p className="font-medium">{child.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha de Nacimiento:</p>
                <p className="font-medium">
                  {format(new Date(child.birth_date), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Edad:</p>
                <p className="font-medium">{child.age} años</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Centro de Atención</h2>
            <p>{child.location}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Datos de Estudio</h2>
            <p>{child.grade || 'No disponible'}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Historia</h2>
            <p className="whitespace-pre-wrap">{child.story || 'No disponible'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};