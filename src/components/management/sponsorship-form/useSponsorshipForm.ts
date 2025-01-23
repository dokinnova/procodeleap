import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child, Sponsor } from "@/types";

export const useSponsorshipForm = (
  initialChild: Child | null,
  initialSponsor: Sponsor | null,
  onClose: () => void,
) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(initialChild);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(initialSponsor);
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSponsorship, setExistingSponsorship] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchExistingSponsorship = async () => {
      if (selectedChild) {
        const { data } = await supabase
          .from('sponsorships')
          .select(`
            *,
            sponsor:sponsors (
              id,
              name,
              email,
              phone,
              contribution,
              status
            )
          `)
          .eq('child_id', selectedChild.id)
          .maybeSingle();

        if (data) {
          setExistingSponsorship(data);
          setStartDate(data.start_date);
          setNotes(data.notes || '');
          setSelectedSponsor(data.sponsor);
        } else {
          setExistingSponsorship(null);
          setStartDate('');
          setNotes('');
          setSelectedSponsor(null);
        }
      }
    };

    fetchExistingSponsorship();
  }, [selectedChild]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando envío del formulario...");
    
    if (!selectedChild || !selectedSponsor || !startDate) {
      toast({
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Datos a enviar:", {
        child_id: selectedChild.id,
        sponsor_id: selectedSponsor.id,
        start_date: startDate,
        notes: notes || null,
      });

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para realizar esta acción",
          variant: "destructive",
        });
        return;
      }

      if (existingSponsorship) {
        const { error } = await supabase
          .from('sponsorships')
          .update({
            sponsor_id: selectedSponsor.id,
            start_date: startDate,
            notes: notes || null,
          })
          .eq('id', existingSponsorship.id);

        if (error) {
          console.error('Error al actualizar:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Apadrinamiento actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('sponsorships')
          .insert([
            {
              child_id: selectedChild.id,
              sponsor_id: selectedSponsor.id,
              start_date: startDate,
              notes: notes || null,
            }
          ]);

        if (error) {
          console.error('Error al insertar:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Apadrinamiento creado correctamente",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      await queryClient.invalidateQueries({ queryKey: ["children"] });
      await queryClient.invalidateQueries({ queryKey: ["available-sponsors"] });
      await queryClient.invalidateQueries({ queryKey: ["available-children"] });

      onClose();
    } catch (error: any) {
      console.error('Error detallado:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el apadrinamiento. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsorship = async () => {
    if (!existingSponsorship) return;

    try {
      const { error } = await supabase
        .from('sponsorships')
        .delete()
        .eq('id', existingSponsorship.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Apadrinamiento eliminado correctamente",
      });

      await queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      await queryClient.invalidateQueries({ queryKey: ["children"] });
      await queryClient.invalidateQueries({ queryKey: ["available-sponsors"] });
      await queryClient.invalidateQueries({ queryKey: ["available-children"] });

      onClose();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el apadrinamiento",
        variant: "destructive",
      });
    }
  };

  return {
    selectedChild,
    selectedSponsor,
    startDate,
    notes,
    isSubmitting,
    existingSponsorship,
    setSelectedChild,
    setSelectedSponsor,
    setStartDate,
    setNotes,
    handleSubmit,
    handleDeleteSponsorship,
  };
};