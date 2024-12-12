import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Child, Sponsor } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChildSelect } from "./sponsorship-form/ChildSelect";
import { SponsorSelect } from "./sponsorship-form/SponsorSelect";
import { SponsorshipFormFields } from "./sponsorship-form/SponsorshipFormFields";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available children (those without sponsorships)
  const { data: availableChildren = [] } = useQuery({
    queryKey: ["available-children"],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("child_id");

      const sponsoredChildIds = sponsorships?.map(s => s.child_id) || [];

      // If there are no sponsorships, fetch all children
      if (sponsoredChildIds.length === 0) {
        const { data: allChildren } = await supabase
          .from("children")
          .select("*");
        return allChildren || [];
      }

      // Otherwise, fetch children not in the sponsored list
      const { data: children } = await supabase
        .from("children")
        .select("*")
        .not("id", "in", `(${sponsoredChildIds.join(",")})`);

      return children || [];
    },
  });

  // Fetch available sponsors (those without active sponsorships)
  const { data: availableSponsors = [] } = useQuery({
    queryKey: ["available-sponsors"],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("sponsor_id");

      const sponsoringIds = sponsorships?.map(s => s.sponsor_id) || [];

      // If there are no sponsorships, fetch all sponsors
      if (sponsoringIds.length === 0) {
        const { data: allSponsors } = await supabase
          .from("sponsors")
          .select("*");
        return allSponsors || [];
      }

      // Otherwise, fetch sponsors not in the sponsoring list
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

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["available-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["available-children"] });

      onClose();
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el apadrinamiento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Apadrinamiento</CardTitle>
        <CardDescription>
          Gestiona la información del apadrinamiento
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
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
