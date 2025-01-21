import { useState } from "react";
import { ChildForm } from "@/components/children/ChildForm";
import { ChildrenTable } from "@/components/children/ChildrenTable";
import { PrintableChildrenList } from "@/components/children/PrintableChildrenList";
import { ChildrenHeader } from "@/components/children/layout/ChildrenHeader";
import { ChildrenError } from "@/components/children/layout/ChildrenError";
import { ChildrenLoading } from "@/components/children/layout/ChildrenLoading";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useSelectedChild } from "@/hooks/useSelectedChild";

const Children = () => {
  const [search, setSearch] = useState("");
  const { selectedChild, setSelectedChild } = useSelectedChild();
  const { data: children = [], isLoading, error, refetch } = useChildrenData();

  if (error) {
    return <ChildrenError error={error as Error} onRetry={refetch} />;
  }

  if (isLoading) {
    return <ChildrenLoading />;
  }

  return (
    <div className="space-y-6">
      <ChildrenHeader />

      <div className="print:hidden">
        <ChildForm 
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
        />

        <ChildrenTable 
          children={children}
          search={search}
          setSearch={setSearch}
          setSelectedChild={setSelectedChild}
        />
      </div>

      <PrintableChildrenList children={children} />
    </div>
  );
};

export default Children;