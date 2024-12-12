import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  const handleAddChild = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newChild = {
      name: formData.get("name") as string,
      age: parseInt(formData.get("age") as string),
      location: formData.get("location") as string,
      story: formData.get("story") as string,
      image_url: formData.get("image_url") as string,
    };
    
    const { error } = await supabase
      .from('children')
      .insert([newChild]);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar al niño. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Éxito",
      description: `${newChild.name} ha sido registrado exitosamente.`,
    });
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error al cargar los datos
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Niños Registrados</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Niño
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Niño</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre completo
                </label>
                <Input name="name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Edad
                </label>
                <Input name="age" type="number" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ubicación
                </label>
                <Input name="location" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Historia
                </label>
                <Input name="story" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL de la imagen
                </label>
                <Input name="image_url" type="url" />
              </div>
              <Button type="submit" className="w-full">
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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