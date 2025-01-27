import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sponsor } from "@/types";

export const useSponsors = () => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      console.log("Obteniendo padrinos...");
      
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
        console.log("No hay sesión al cargar padrinos");
        return;
      }

      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Padrinos obtenidos:", data);
      setSponsors(data || []);
    } catch (error) {
      console.error('Error al cargar padrinos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los padrinos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
        });
        return;
      }

      if (!formData.name || !formData.email || !formData.contribution || !formData.status) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor complete los campos requeridos",
        });
        return;
      }

      const sponsorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        contribution: Number(formData.contribution),
        status: formData.status,
      };

      console.log("Guardando datos del padrino:", sponsorData);

      if (formData.id) {
        const { error: updateError } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', formData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsors')
          .insert([sponsorData]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Éxito",
        description: formData.id 
          ? "Padrino actualizado correctamente"
          : "Padrino registrado correctamente",
      });

      loadSponsors();
    } catch (error: any) {
      console.error('Error al guardar padrino:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el padrino",
      });
    }
  };

  return {
    sponsors,
    isLoading,
    loadSponsors,
    handleSubmit,
  };
};