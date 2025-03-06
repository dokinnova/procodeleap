
import { FileText } from "lucide-react";
import { Child } from "@/types";
import { CompleteReportButton } from "./CompleteReportButton";

interface ChildrenListsHeaderProps {
  childrenWithoutSponsorship: Child[];
  childrenWithSponsorship: Child[];
  getSponsorName: (childId: string) => string;
}

export const ChildrenListsHeader = ({
  childrenWithoutSponsorship,
  childrenWithSponsorship,
  getSponsorName,
}: ChildrenListsHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">Gestión de Apadrinamientos</h2>
      </div>
      <CompleteReportButton 
        childrenWithoutSponsorship={childrenWithoutSponsorship}
        childrenWithSponsorship={childrenWithSponsorship}
        getSponsorName={getSponsorName}
      />
    </div>
  );
};
