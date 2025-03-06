
import { Child } from "@/types";
import { ChildTable } from "../ChildTable";

interface SponsoredChildrenTableProps {
  children: Child[];
  getSponsorName: (childId: string) => string;
  onChildSelect: (child: Child) => void;
  sponsorships: any[];
}

export const SponsoredChildrenTable = ({
  children,
  getSponsorName,
  onChildSelect,
  sponsorships,
}: SponsoredChildrenTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-primary">
      <ChildTable
        children={children}
        title="Niños con Padrinos"
        emptyMessage="No hay niños con padrinos asignados"
        showSponsor={true}
        getSponsorName={getSponsorName}
        onChildSelect={onChildSelect}
        sponsorships={sponsorships}
      />
    </div>
  );
};
