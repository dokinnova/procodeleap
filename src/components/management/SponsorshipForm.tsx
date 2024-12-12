import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Child, Sponsor } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChildSelect } from "./sponsorship-form/ChildSelect";
import { SponsorSelect } from "./sponsorship-form/SponsorSelect";
import { SponsorshipFormFields } from "./sponsorship-form/SponsorshipFormFields";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SponsorshipFormProps {
  child: Child | null;
  sponsor: Sponsor | null;
  onClose: () => void;
}

export const SponsorshipForm = ({ 
  child: initialChild, 
  sponsor: initialSponsor, 
  onClose 
}: SponsorshipFormProps) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(initialChild);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(initialSponsor);
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSponsorship, setExistingSponsorship] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing sponsorship if child is already sponsored
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

  // Fetch available children (those without sponsorships or the current child)
  const { data: availableChildren = [] } = useQuery({
    queryKey: ["available-children", selectedChild?.id],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("child_id");

      const sponsoredChildIds = sponsorships?.map(s => s.child_id) || [];

      // If there are no sponsorships or we're editing the current child's sponsorship
      if (sponsoredChildIds.length === 0) {
        const { data: allChildren } = await supabase
          .from("children")
          .select("*");
        return allChildren || [];
      }

      // Filter out the current child's ID from the exclusion list if we're editing
      if (selectedChild) {
        const filteredIds = sponsoredChildIds.filter(id => id !== selectedChild.id);
        if (filteredIds.length === 0) {
          const { data: allChildren } = await supabase
            .from("children")
            .select("*");
          return allChildren || [];
        }
        sponsoredChildIds.length = 0;
        sponsoredChildIds.push(...filteredIds);
      }

      const { data: children } = await supabase
        .from("children")
        .select("*")
        .not("id", "in", `(${sponsoredChildIds.join(",")})`);

      return children || [];
    },
  });

  // Fetch available sponsors (those without active sponsorships or the current sponsor)
  const { data: availableSponsors = [] } = useQuery({
    queryKey: ["available-sponsors", selectedSponsor?.id],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("sponsor_id");

      const sponsoringIds = sponsorships?.map(s => s.sponsor_id) || [];

      // If there are no sponsorships or we're editing the current sponsorship
      if (sponsoringIds.length === 0) {
        const { data: allSponsors } = await supabase
          .from("sponsors")
          .select("*");
        return allSponsors || [];
      }

      // Filter out the current sponsor's ID from the exclusion list if we're editing
      if (selectedSponsor) {
        const filteredIds = sponsoringIds.filter(id => id !== selectedSponsor.id);
        if (filteredIds.length === 0) {
          const { data: allSponsors } = await supabase
            .from("sponsors")
            .select("*");
          return allSponsors || [];
        }
        sponsoringIds.length = 0;
        sponsoringIds.push(...filteredIds);
      }

      const { data: sponsors } = await supabase
        .from("sponsors")
        .select("*")
        .not("id", "in", `(${sponsoringIds.join(",")})`);

      return sponsors || [];
    },
  });

  const handleChildSelect = (childId: string) => {
    const child = availableChildren.find(c => c.id === childId);
    setSelectedChild(child || null);
  };

  const handleSponsorSelect = (sponsorId: string) => {
    const sponsor = availableSponsors.find(s => s.id === sponsorId);
    setSelectedSponsor(sponsor || null);
  };

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
        // Update existing sponsorship
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
        // Create new sponsorship
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

      // Invalidate queries to refresh the data
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

      // Invalidate queries to refresh the data
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingSponsorship ? 'Gestionar Apadrinamiento' : 'Nuevo Apadrinamiento'}
        </CardTitle>
        <CardDescription>
          {existingSponsorship 
            ? 'Modifica o elimina el apadrinamiento existente'
            : 'Crea un nuevo apadrinamiento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ChildSelect
            availableChildren={availableChildren}
            selectedChild={selectedChild}
            onChildSelect={handleChildSelect}
          />

          <SponsorSelect
            availableSponsors={availableSponsors}
            selectedSponsor={selectedSponsor}
            onSponsorSelect={handleSponsorSelect}
          />

          <SponsorshipFormFields
            startDate={startDate}
            notes={notes}
            onStartDateChange={setStartDate}
            onNotesChange={setNotes}
          />

          <div className="flex justify-end gap-2">
            {existingSponsorship && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    Eliminar Apadrinamiento
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente el apadrinamiento entre {selectedChild?.name} y {selectedSponsor?.name}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSponsorship}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : (existingSponsorship ? "Actualizar" : "Guardar")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};