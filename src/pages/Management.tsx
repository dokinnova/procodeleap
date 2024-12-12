import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Child, Sponsor } from "@/types";
import { ManagementHeader } from "@/components/management/ManagementHeader";
import { AvailableSponsorsTable } from "@/components/management/AvailableSponsorsTable";
import { ChildrenLists } from "@/components/management/ChildrenLists";

const Management = () => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sponsorships = [], isLoading: isLoadingSponsorships } = useQuery({
    queryKey: ["sponsorships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorships")
        .select(`
          *,
          sponsor:sponsors (
            id,
            name
          )
        `);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allSponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter children with and without sponsorships
  const childrenWithSponsorship = children.filter(child => 
    sponsorships.some(s => s.child_id === child.id)
  );

  const childrenWithoutSponsorship = children.filter(child => 
    !sponsorships.some(s => s.child_id === child.id)
  );

  // Filter out sponsors who already have a sponsorship
  const availableSponsors = allSponsors.filter(sponsor => 
    !sponsorships.some(s => s.sponsor_id === sponsor.id)
  );

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setIsFormOpen(true);
  };

  const handleSponsorSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedChild(null);
    setSelectedSponsor(null);
  };

  return (
    <div className="container mx-auto py-8">
      <ManagementHeader
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        selectedChild={selectedChild}
        selectedSponsor={selectedSponsor}
        onFormClose={handleFormClose}
      />

      <div className="space-y-6">
        <ChildrenLists
          childrenWithoutSponsorship={childrenWithoutSponsorship}
          childrenWithSponsorship={childrenWithSponsorship}
          onChildSelect={handleChildSelect}
          sponsorships={sponsorships}
        />

        {/* Lista de Padrinos Disponibles */}
        <AvailableSponsorsTable
          sponsors={availableSponsors}
          onSponsorSelect={handleSponsorSelect}
          isLoading={isLoadingSponsors || isLoadingSponsorships}
        />
      </div>
    </div>
  );
};

export default Management;