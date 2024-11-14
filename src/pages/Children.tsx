import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Niños</h1>
          <p className="text-gray-600 mt-2">Gestiona los registros de los niños</p>
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

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Buscar niños..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <img
              src={child.imageUrl}
              alt={child.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{child.name}</h3>
              <p className="text-gray-600 mb-1">{child.age} años</p>
              <p className="text-gray-600 mb-2">{child.location}</p>
              <p className="text-gray-600">{child.story}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Children;