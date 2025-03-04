
import { useState, useEffect } from "react";
import { ChildForm } from "@/components/children/ChildForm";
import { ChildrenTable } from "@/components/children/ChildrenTable";
import { PrintableChildrenList } from "@/components/children/PrintableChildrenList";
import { ChildrenHeader } from "@/components/children/layout/ChildrenHeader";
import { ChildrenError } from "@/components/children/layout/ChildrenError";
import { ChildrenLoading } from "@/components/children/layout/ChildrenLoading";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useSelectedChild } from "@/hooks/useSelectedChild";
import { Child } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { CHILDREN_QUERY_KEY } from "@/hooks/useChildrenData";

const Children = () => {
  const [search, setSearch] = useState("");
  const { selectedChild, setSelectedChild } = useSelectedChild();
  const queryClient = useQueryClient();
  const { data: children = [], isLoading, error, refetch } = useChildrenData();

  // Effect to refetch children data when the component mounts or when a child is unselected
  useEffect(() => {
    if (!selectedChild) {
      console.log('Children component: Refreshing data...');
      queryClient.invalidateQueries({ queryKey: [CHILDREN_QUERY_KEY] });
    }
  }, [selectedChild, queryClient]);

  const handleChildSelect = (child: Child) => {
    console.log('Seleccionando niño:', child);
    setSelectedChild(child);
  };

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
          setSelectedChild={handleChildSelect}
        />
      </div>

      <PrintableChildrenList children={children} />
    </div>
  );
};

export default Children;
