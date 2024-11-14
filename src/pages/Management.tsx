import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Sponsorship {
  id: string;
  childId: string;
  sponsorId: string;
  startDate: string;
}

const Management = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const { toast } = useToast();

  // In a real app, these would come from your backend
  const children = [
    { id: "1", name: "Ana García" },
    { id: "2", name: "Juan Pérez" },
  ];

  const sponsors = [
    { id: "1", name: "María López" },
    { id: "2", name: "Carlos Rodríguez" },
  ];

  const handleCreateSponsorship = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newSponsorship: Sponsorship = {
      id: Date.now().toString(),
      childId: formData.get("childId") as string,
      sponsorId: formData.get("sponsorId") as string,
      startDate: new Date().toISOString(),
    };
    
    setSponsorships([...sponsorships, newSponsorship]);
    toast({
      title: "Apadrinamiento creado",
      description: "La relación de apadrinamiento ha sido registrada exitosamente.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Apadrinamientos</h1>
          <p className="text-gray-600 mt-2">Administra las relaciones entre padrinos y niños</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              Crear apadrinamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear nuevo apadrinamiento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSponsorship} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar niño</label>
                <Select name="childId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un niño" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seleccionar padrino</label>
                <Select name="sponsorId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un padrino" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.map(sponsor => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Crear apadrinamiento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsorships.map((sponsorship, index) => {
          const child = children.find(c => c.id === sponsorship.childId);
          const sponsor = sponsors.find(s => s.id === sponsorship.sponsorId);
          
          return (
            <motion.div
              key={sponsorship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {child?.name}
                  </h3>
                  <p className="text-gray-600">
                    Apadrinado por: {sponsor?.name}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Inicio: {new Date(sponsorship.startDate).toLocaleDateString()}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Management;