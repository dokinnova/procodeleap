import { Card, CardContent } from "@/components/ui/card";
import { Child, Sponsor } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipFormHeader } from "./sponsorship-form/SponsorshipFormHeader";
import { FormActions } from "./sponsorship-form/FormActions";
import { ChildSelect } from "./sponsorship-form/ChildSelect";
import { SponsorSelect } from "./sponsorship-form/SponsorSelect";
import { SponsorshipFormFields } from "./sponsorship-form/SponsorshipFormFields";
import { useSponsorshipForm } from "./sponsorship-form/useSponsorshipForm";

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
  const {
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
  } = useSponsorshipForm(initialChild, initialSponsor, onClose);

  const { data: availableChildren = [] } = useQuery({
    queryKey: ["available-children", selectedChild?.id],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("child_id");

      const sponsoredChildIds = sponsorships?.map(s => s.child_id) || [];

      if (sponsoredChildIds.length === 0) {
        const { data: allChildren } = await supabase
          .from("children")
          .select("*");
        return allChildren || [];
      }

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

  const { data: availableSponsors = [] } = useQuery({
    queryKey: ["available-sponsors", selectedSponsor?.id],
    queryFn: async () => {
      const { data: sponsorships } = await supabase
        .from("sponsorships")
        .select("sponsor_id");

      const sponsoringIds = sponsorships?.map(s => s.sponsor_id) || [];

      if (sponsoringIds.length === 0) {
        const { data: allSponsors } = await supabase
          .from("sponsors")
          .select("*");
        return allSponsors || [];
      }

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

  return (
    <Card>
      <SponsorshipFormHeader existingSponsorship={existingSponsorship} />
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

          <FormActions
            existingSponsorship={existingSponsorship}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onDelete={handleDeleteSponsorship}
            selectedChild={selectedChild}
            selectedSponsor={selectedSponsor}
          />
        </form>
      </CardContent>
    </Card>
  );
};