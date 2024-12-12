import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const { data: children, refetch } = useQuery({
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
      console.error('Error adding child:', error);
      return;
    }

    toast({
      title: "Niño registrado",
      description: `${newChild.name} ha sido registrado exitosamente.`,
    });
    
    refetch();
  };

  const filteredChildren = children?.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Inicio</a>
            </li>
            <li className="flex items-center space-x-1">
              <span>/</span>
              <span className="text-gray-900">Niños</span>
            </li>
          </ol>
        </nav>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Niños</h1>
            <p className="text-muted-foreground">
              Administra los registros y la información de los niños
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Registrar niño
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar nuevo niño</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input id="age" name="age" type="number" required />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" name="location" required />
                </div>
                <div>
                  <Label htmlFor="story">Historia</Label>
                  <Input id="story" name="story" />
                </div>
                <div>
                  <Label htmlFor="image_url">URL de la imagen</Label>
                  <Input id="image_url" name="image_url" type="url" />
                </div>
                <Button type="submit" className="w-full">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Buscar niños..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-lg">
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
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Children;