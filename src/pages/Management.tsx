import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { Child, Sponsor } from "@/types";
import { SponsorshipForm } from "@/components/management/SponsorshipForm";
import { AvailableSponsorsTable } from "@/components/management/AvailableSponsorsTable";

const Management = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sponsorships = [], isLoading: isLoadingSponsorships } = useQuery({
    queryKey: ["sponsorships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorships")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allSponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter out sponsors who already have a sponsorship
  const availableSponsors = allSponsors.filter(sponsor => 
    !sponsorships.some(s => s.sponsor_id === sponsor.id)
  );

  const filteredChildren = children.filter((child: Child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setIsFormOpen(true);
  };

  const handleSponsorSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Apadrinamientos</h1>
          <p className="text-gray-600 mt-2">
            Administra las relaciones entre padrinos y niños
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Apadrinamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <SponsorshipForm
              child={selectedChild}
              sponsor={selectedSponsor}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedChild(null);
                setSelectedSponsor(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista de Niños */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Niño</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingChildren ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredChildren.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChildren.map((child: Child) => (
                    <TableRow 
                      key={child.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleChildSelect(child)}
                    >
                      <TableCell>{child.name}</TableCell>
                      <TableCell>{child.age} años</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Lista de Padrinos Disponibles */}
        <AvailableSponsorsTable
          sponsors={availableSponsors}
          onSponsorSelect={handleSponsorSelect}
          isLoading={isLoadingSponsors || isLoadingSponsorships}
        />
      </div>
    </div>
  );
};

export default Management;