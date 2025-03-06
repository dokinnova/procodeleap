
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { ChildrenReportHeader } from "@/components/reports/children/ChildrenReportHeader";
import { ChildrenSearchFilter } from "@/components/reports/children/ChildrenSearchFilter";
import { ChildrenReportTable } from "@/components/reports/children/ChildrenReportTable";
import { ChildrenPrintableView } from "@/components/reports/children/ChildrenPrintableView";
import { ChildrenErrorState } from "@/components/reports/children/ChildrenErrorState";
import { ChildrenLoadingState } from "@/components/reports/children/ChildrenLoadingState";
import { useChildrenReport } from "@/hooks/useChildrenReport";

const ChildrenReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: children = [], isLoading, error, refetch } = useChildrenReport();

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <ChildrenLoadingState />;
  }

  if (error) {
    return <ChildrenErrorState error={error} refetch={refetch} />;
  }

  return (
    <div className="space-y-4">
      <ChildrenReportHeader children={filteredChildren} />
      
      <CardContent>
        <div className="space-y-4">
          <ChildrenSearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          
          <ChildrenReportTable filteredChildren={filteredChildren} />
        </div>
      </CardContent>

      <ChildrenPrintableView filteredChildren={filteredChildren} />
    </div>
  );
};

export default ChildrenReport;
