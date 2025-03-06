
import { Child } from "@/types";
import { ChildTable } from "./ChildTable";
import { ChildrenListsHeader } from "./children-lists/ChildrenListsHeader";
import { SponsorshipDivider } from "./children-lists/SponsorshipDivider";
import { SponsoredChildrenTable } from "./children-lists/SponsoredChildrenTable";
import { AllChildrenPrintableView } from "./children-lists/AllChildrenPrintableView";

interface ChildrenListsProps {
  childrenWithoutSponsorship: Child[];
  childrenWithSponsorship: Child[];
  onChildSelect: (child: Child) => void;
  sponsorships: any[];
}

export const ChildrenLists = ({
  childrenWithoutSponsorship,
  childrenWithSponsorship,
  onChildSelect,
  sponsorships,
}: ChildrenListsProps) => {
  const getSponsorName = (childId: string) => {
    const sponsorship = sponsorships.find(s => s.child_id === childId);
    return sponsorship?.sponsor?.name || 'No disponible';
  };

  return (
    <>
      <ChildrenListsHeader 
        childrenWithoutSponsorship={childrenWithoutSponsorship}
        childrenWithSponsorship={childrenWithSponsorship}
        getSponsorName={getSponsorName}
      />

      <ChildTable
        children={childrenWithoutSponsorship}
        title="Niños sin Padrinos"
        emptyMessage="No hay niños sin padrinos asignados"
        onChildSelect={onChildSelect}
        sponsorships={sponsorships}
      />

      <SponsorshipDivider />

      <SponsoredChildrenTable 
        children={childrenWithSponsorship}
        getSponsorName={getSponsorName}
        onChildSelect={onChildSelect}
        sponsorships={sponsorships}
      />

      <AllChildrenPrintableView 
        childrenWithoutSponsorship={childrenWithoutSponsorship}
        childrenWithSponsorship={childrenWithSponsorship}
        getSponsorName={getSponsorName}
      />
    </>
  );
};
