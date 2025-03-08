
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
          .select(`*, sponsor:sponsors (*)`)
          .eq('child_id', selectedChild.id)
          .maybeSingle();

        setExistingSponsorship(data);
        if (data) {
          setStartDate(data.start_date);
          setNotes(data.notes || '');
          // Add image_url to the sponsor data before setting
          if (data.sponsor) {
            const sponsorWithImage = {
              ...data.sponsor,
              image_url: data.sponsor.image_url || null
            };
            setSelectedSponsor(sponsorWithImage as Sponsor);
          }
        } else {
          setStartDate('');
          setNotes('');
          setSelectedSponsor(null);
        }
      }
    };

    fetchExistingSponsorship();
  }, [selectedChild]);

  const invalidateQueries = async () => {
    const queries = ["sponsorships", "sponsors", "children", "available-sponsors", "available-children"];
    await Promise.all(queries.map(query => queryClient.invalidateQueries({ queryKey: [query] })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Debes iniciar sesión para realizar esta acción");
      }

      const sponsorshipData = {
        sponsor_id: selectedSponsor.id,
        start_date: startDate,
        notes: notes || null,
      };

      const { error } = existingSponsorship
        ? await supabase
            .from('sponsorships')
            .update(sponsorshipData)
            .eq('id', existingSponsorship.id)
        : await supabase
            .from('sponsorships')
            .insert([{ ...sponsorshipData, child_id: selectedChild.id }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: existingSponsorship 
          ? "Apadrinamiento actualizado correctamente"
          : "Apadrinamiento creado correctamente",
      });

      await invalidateQueries();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el apadrinamiento",
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

      await invalidateQueries();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
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
