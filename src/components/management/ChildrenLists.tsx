import { Child } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ChildTable } from "./ChildTable";

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
      <ChildTable
        children={childrenWithoutSponsorship}
        title="Niños sin Padrinos"
        emptyMessage="No hay niños sin padrinos asignados"
        onChildSelect={onChildSelect}
        sponsorships={sponsorships}
      />

      <div className="relative py-8">
        <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
        <div className="relative z-10 flex justify-center">
          <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Apadrinamientos Activos
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border-2 border-primary">
        <ChildTable
          children={childrenWithSponsorship}
          title="Niños con Padrinos"
          emptyMessage="No hay niños con padrinos asignados"
          showSponsor={true}
          getSponsorName={getSponsorName}
          onChildSelect={onChildSelect}
          sponsorships={sponsorships}
        />
      </div>
    </>
  );
};