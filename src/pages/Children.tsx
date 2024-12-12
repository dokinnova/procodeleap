import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, School, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  story: string;
  imageUrl: string;
}

const Children = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const handleAddChild = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newChild: Child = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      age: parseInt(formData.get("age") as string),
      location: formData.get("location") as string,
      story: formData.get("story") as string,
      imageUrl: formData.get("imageUrl") as string,
    };
    
    setChildren([...children, newChild]);
    toast({
      title: "Niño registrado",
      description: `${newChild.name} ha sido registrado exitosamente.`,
    });
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
                  <Input id="story" name="story" required />
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL de la imagen</Label>
                  <Input id="imageUrl" name="imageUrl" type="url" required />
                </div>
                <Button type="submit" className="w-full">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
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

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={child.imageUrl}
                alt={child.name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <School className="h-4 w-4 mr-2" />
                  <span>{child.age} años</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{child.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="line-clamp-2">{child.story}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Children;