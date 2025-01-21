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
import { useToast } from "@/hooks/use-toast";

const Children = () => {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: children = [], isLoading, error, refetch } = useChildrenData();

  useEffect(() => {
    if (location.state?.selectedChild) {
      const child = location.state.selectedChild;
      try {
        setSelectedChild({
          ...child,
          birth_date: child.birth_date || '',
          story: child.story || '',
          school_id: child.school_id || '',
          grade: child.grade || '',
          image_url: child.image_url || null,
          status: child.status || 'pending',
        });
      } catch (error) {
        console.error('Error al establecer el niño seleccionado:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del niño seleccionado",
          variant: "destructive",
        });
      } finally {
        // Limpiar el estado de navegación inmediatamente
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state?.selectedChild]);

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