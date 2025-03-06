
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
import { DocumentManager } from "@/components/children/documents/DocumentManager";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, List } from "lucide-react";

const Children = () => {
  const [search, setSearch] = useState("");
  const { selectedChild, setSelectedChild } = useSelectedChild();
  const queryClient = useQueryClient();
  const { data: children = [], isLoading, error, refetch } = useChildrenData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("list");

  // When a child is selected, switch to the edit tab
  useEffect(() => {
    if (selectedChild) {
      setActiveTab("edit");
    }
  }, [selectedChild]);

  // Effect to refetch children data when the component mounts or when a child is unselected
  useEffect(() => {
    if (!selectedChild) {
      console.log('Children component: Refreshing data...');
      queryClient.invalidateQueries({ queryKey: [CHILDREN_QUERY_KEY] });
    }
  }, [selectedChild, queryClient]);

  useEffect(() => {
    console.log('Children component: Selected child:', selectedChild);
  }, [selectedChild]);

  const handleChildSelect = (child: Child) => {
    try {
      console.log('Seleccionando niño:', child);
      // Ensure we're passing the complete child object with all required fields
      const completeChild = children.find(c => c.id === child.id);
      if (completeChild) {
        setSelectedChild(completeChild);
      } else {
        setSelectedChild(child);
        console.warn('Child not found in current children list');
      }
    } catch (error) {
      console.error('Error al seleccionar niño:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al seleccionar el niño",
        variant: "destructive",
      });
    }
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Buscar Niños
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> {selectedChild ? `Editar: ${selectedChild.name}` : 'Registrar Niño'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <div>
              <ChildrenTable 
                children={children}
                search={search}
                setSearch={setSearch}
                setSelectedChild={handleChildSelect}
              />
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <ChildForm 
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
            />

            {selectedChild && (
              <div className="mt-8 border rounded-lg p-4 bg-white shadow-sm">
                <DocumentManager 
                  childId={selectedChild.id}
                  childName={selectedChild.name}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PrintableChildrenList children={children} />
    </div>
  );
};

export default Children;
