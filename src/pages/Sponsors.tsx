import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sponsor {
  id: string;
  name: string;
  email: string;
  phone: string;
  contribution: number;
}

const Sponsors = () => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: selectedSponsor?.name || '',
    email: selectedSponsor?.email || '',
    phone: selectedSponsor?.phone || '',
    contribution: selectedSponsor?.contribution || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los padrinos",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.contribution) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete los campos requeridos",
      });
      return;
    }

    try {
      const sponsorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        contribution: Number(formData.contribution),
      };

      let error;
      if (selectedSponsor) {
        const { error: updateError } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', selectedSponsor.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsors')
          .insert([sponsorData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: selectedSponsor 
          ? "Padrino actualizado correctamente"
          : "Padrino registrado correctamente",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        contribution: '',
      });
      setSelectedSponsor(null);
      loadSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el padrino",
      });
    }
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Padrinos Registrados</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSponsor ? 'Editar Padrino' : 'Registrar Nuevo Padrino'}
          </CardTitle>
          <CardDescription>
            {selectedSponsor 
              ? 'Modifica los datos del padrino seleccionado' 
              : 'Ingresa los datos para registrar un nuevo padrino'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Nombre del padrino"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contribution">Contribución mensual</Label>
              <Input
                id="contribution"
                type="number"
                placeholder="Contribución mensual"
                value={formData.contribution}
                onChange={(e) => handleInputChange('contribution', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              {selectedSponsor && (
                <Button variant="outline" onClick={() => setSelectedSponsor(null)}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                {selectedSponsor ? 'Actualizar' : 'Registrar'}
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
                <TableHead>Email</TableHead>
                <TableHead>Contribución</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSponsors.map((sponsor) => (
                <TableRow 
                  key={sponsor.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSponsor(sponsor);
                    setFormData({
                      name: sponsor.name,
                      email: sponsor.email,
                      phone: sponsor.phone || '',
                      contribution: sponsor.contribution.toString(),
                    });
                  }}
                >
                  <TableCell className="font-medium">{sponsor.name}</TableCell>
                  <TableCell>{sponsor.email}</TableCell>
                  <TableCell>${sponsor.contribution}/mes</TableCell>
                </TableRow>
              ))}
              {filteredSponsors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No se encontraron padrinos
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

export default Sponsors;