import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Sponsor {
  id: string;
  name: string;
  email: string;
  phone: string;
  contribution: number;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const handleAddSponsor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newSponsor: Sponsor = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      contribution: parseFloat(formData.get("contribution") as string),
    };
    
    setSponsors([...sponsors, newSponsor]);
    toast({
      title: "Padrino registrado",
      description: `${newSponsor.name} ha sido registrado exitosamente.`,
    });
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Padrinos</h1>
          <p className="text-gray-600 mt-2">Gestiona los registros de los padrinos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Registrar padrino
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar nuevo padrino</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSponsor} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div>
                <Label htmlFor="contribution">Contribución mensual</Label>
                <Input id="contribution" name="contribution" type="number" required />
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
          placeholder="Buscar padrinos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSponsors.map((sponsor, index) => (
          <motion.div
            key={sponsor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-xl font-semibold mb-2">{sponsor.name}</h3>
            <p className="text-gray-600 mb-1">{sponsor.email}</p>
            <p className="text-gray-600 mb-1">{sponsor.phone}</p>
            <p className="text-primary font-semibold">
              ${sponsor.contribution}/mes
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Sponsors;