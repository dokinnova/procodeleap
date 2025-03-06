
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { School as SchoolIcon, List, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { SchoolsTable } from "@/components/schools/SchoolsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface School {
  id: string;
  name: string;
  address: string | null;
}

const Schools = () => {
  const [session, setSession] = useState(null);
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [activeTab, setActiveTab] = useState<string>("list");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cuando se selecciona un colegio, cambiar a la pestaña de edición
  useEffect(() => {
    if (selectedSchool) {
      setActiveTab("edit");
    }
  }, [selectedSchool]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch schools data
  const { data: schools = [], isLoading, error } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*");
      if (error) throw error;
      return data as School[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("El nombre del colegio es requerido");
      return;
    }

    try {
      if (selectedSchool) {
        const { error } = await supabase
          .from("schools")
          .update({
            name: formData.name,
            address: formData.address
          })
          .eq('id', selectedSchool.id);

        if (error) throw error;
        toast.success("Colegio actualizado exitosamente");
      } else {
        const { error } = await supabase
          .from("schools")
          .insert([{
            name: formData.name,
            address: formData.address
          }]);

        if (error) throw error;
        toast.success("Colegio registrado exitosamente");
      }

      setFormData({ name: '', address: '' });
      setSelectedSchool(null);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la operación");
    }
  };

  const handleCancel = () => {
    setSelectedSchool(null);
    setFormData({ name: '', address: '' });
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      address: school.address || ''
    });
  };

  if (!session) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4">
        <p className="text-lg text-red-500">Error al cargar los datos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SchoolIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Colegios Registrados</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" /> Buscar Colegios
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> {selectedSchool ? `Editar: ${selectedSchool.name}` : 'Registrar Colegio'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <SchoolsTable
            schools={schools}
            search={search}
            setSearch={setSearch}
            onSelectSchool={handleSelectSchool}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <SchoolForm
            formData={formData}
            selectedSchool={selectedSchool}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schools;
