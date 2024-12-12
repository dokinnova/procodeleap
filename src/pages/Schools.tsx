import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { School, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface School {
  id: string;
  name: string;
  address: string | null;
}

const Schools = () => {
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: selectedSchool?.name || '',
    address: selectedSchool?.address || ''
  });

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
    
    if (!formData.name.trim()) {
      toast.error("El nombre del colegio es requerido");
      return;
    }

    try {
      if (selectedSchool) {
        // Actualizar colegio existente
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
        // Insertar nuevo colegio
        const { error } = await supabase
          .from("schools")
          .insert([{
            name: formData.name,
            address: formData.address
          }]);

        if (error) throw error;
        toast.success("Colegio registrado exitosamente");
      }

      // Limpiar formulario y actualizar datos
      setFormData({ name: '', address: '' });
      setSelectedSchool(null);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la operación");
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <School className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Colegios Registrados</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSchool ? 'Editar Colegio' : 'Registrar Nuevo Colegio'}
          </CardTitle>
          <CardDescription>
            {selectedSchool 
              ? 'Modifica los datos del colegio seleccionado' 
              : 'Ingresa los datos para registrar un nuevo colegio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del colegio</Label>
              <Input
                id="name"
                placeholder="Nombre del colegio"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Dirección del colegio"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              {selectedSchool && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedSchool(null);
                    setFormData({ name: '', address: '' });
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {selectedSchool ? 'Actualizar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 bg-white"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow 
                  key={school.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSchool(school);
                    setFormData({
                      name: school.name,
                      address: school.address || ''
                    });
                  }}
                >
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.address || "No disponible"}</TableCell>
                </TableRow>
              ))}
              {filteredSchools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                    No se encontraron colegios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Schools;