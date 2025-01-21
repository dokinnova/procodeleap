import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChildForm } from "@/components/children/ChildForm";
import { ChildrenTable } from "@/components/children/ChildrenTable";
import { PrintableChildrenList } from "@/components/children/PrintableChildrenList";
import { ChildrenHeader } from "@/components/children/layout/ChildrenHeader";
import { ChildrenError } from "@/components/children/layout/ChildrenError";
import { ChildrenLoading } from "@/components/children/layout/ChildrenLoading";
import { useChildrenData } from "@/hooks/useChildrenData";
import { Child } from "@/types";

const Children = () => {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: children = [], isLoading, error, refetch } = useChildrenData();

  useEffect(() => {
    if (location.state?.selectedChild) {
      console.log('Setting selected child from navigation:', location.state.selectedChild);
      const child = location.state.selectedChild;
      setSelectedChild({
        ...child,
        birth_date: child.birth_date || '',
        story: child.story || '',
        school_id: child.school_id || '',
        grade: child.grade || '',
        image_url: child.image_url || null,
        status: child.status || 'pending',
      });
      // Clear navigation state to prevent issues on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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