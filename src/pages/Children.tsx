import { useState } from "react";
import { Baby, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
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

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista de niños */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Baby className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Niños Registrados</h1>
        </div>

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
                <TableHead>Edad</TableHead>
                <TableHead>Ubicación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChildren.map((child) => (
                <TableRow 
                  key={child.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedChild(child)}
                >
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>{child.age} años</TableCell>
                  <TableCell>{child.location}</TableCell>
                </TableRow>
              ))}
              {filteredChildren.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No se encontraron niños
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Formulario de mantenimiento */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedChild ? 'Editar Niño' : 'Registrar Nuevo Niño'}
            </CardTitle>
            <CardDescription>
              {selectedChild 
                ? 'Modifica los datos del niño seleccionado' 
                : 'Ingresa los datos para registrar un nuevo niño'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Nombre del niño"
                  value={selectedChild?.name || ''}
                  onChange={() => {}}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Edad"
                  value={selectedChild?.age || ''}
                  onChange={() => {}}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ubicación"
                  value={selectedChild?.location || ''}
                  onChange={() => {}}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Historia</Label>
                <Input
                  id="story"
                  placeholder="Historia del niño"
                  value={selectedChild?.story || ''}
                  onChange={() => {}}
                />
              </div>

              <div className="flex justify-end gap-2">
                {selectedChild && (
                  <Button variant="outline" onClick={() => setSelectedChild(null)}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  {selectedChild ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Children;