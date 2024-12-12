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
              contribution
            )
          `)
          .eq('child_id', selectedChild.id)
          .single();

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
    
    if (!selectedChild || !selectedSponsor || !startDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingSponsorship) {
        const { error } = await supabase
          .from('sponsorships')
          .update({
            sponsor_id: selectedSponsor.id,
            start_date: startDate,
            notes: notes || null,
          })
          .eq('id', existingSponsorship.id);

        if (error) throw error;

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

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Apadrinamiento creado correctamente",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["available-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["available-children"] });

      onClose();
    } catch (error) {
      console.error('Error saving sponsorship:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el apadrinamiento",
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

      queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["available-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["available-children"] });

      onClose();
    } catch (error) {
      console.error('Error deleting sponsorship:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el apadrinamiento",
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