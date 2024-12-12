import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  story: string | null;
  image_url: string | null;
  school_id: string | null;
}

const Children = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching children:', error);
        throw error;
      }
      
      return data as Child[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">Error al cargar los datos</p>
      </div>
    );
  }

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Niños Registrados</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Niño
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Buscar niños..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Historia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChildren.map((child) => (
              <TableRow key={child.id}>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{child.age}</TableCell>
                <TableCell>{child.location}</TableCell>
                <TableCell>{child.story || "No disponible"}</TableCell>
              </TableRow>
            ))}
            {filteredChildren.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron niños
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Children;