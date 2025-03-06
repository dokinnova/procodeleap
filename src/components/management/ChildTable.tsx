
import { Child } from "@/types";
import { TableHeader } from "./child-table/TableHeader";
import { TableContent } from "./child-table/TableContent";
import { PrintableView } from "./child-table/PrintableView";
import { usePrintPdf } from "@/hooks/usePrintPdf";

interface ChildTableProps {
  children: Child[];
  title: string;
  emptyMessage: string;
  showSponsor?: boolean;
  onChildSelect: (child: Child) => void;
  getSponsorName?: (childId: string) => string;
  sponsorships: any[];
}

export const ChildTable = ({
  children,
  title,
  emptyMessage,
  showSponsor = false,
  onChildSelect,
  getSponsorName,
  sponsorships,
}: ChildTableProps) => {
  const { handlePrintProfile, handlePrintTable } = usePrintPdf();

  return (
    <div className="bg-white rounded-lg shadow">
      <TableHeader 
        title={title} 
        onPrintTable={() => handlePrintTable(title)} 
      />
      
      <TableContent
        children={children}
        title={title}
        emptyMessage={emptyMessage}
        showSponsor={showSponsor}
        onChildSelect={onChildSelect}
        getSponsorName={getSponsorName}
        sponsorships={sponsorships}
        onPrintProfile={handlePrintProfile}
      />

      {/* Elemento oculto para impresión */}
      <div id={`table-printable-${title.replace(/\s+/g, '-')}`}>
        <PrintableView
          title={title}
          children={children}
          emptyMessage={emptyMessage}
          showSponsor={showSponsor}
          getSponsorName={getSponsorName}
          sponsorships={sponsorships}
        />
      </div>
    </div>
  );
};
