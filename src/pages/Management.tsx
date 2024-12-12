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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  // Filter children with and without sponsorships
  const childrenWithSponsorship = children.filter(child => 
    sponsorships.some(s => s.child_id === child.id)
  );

  const childrenWithoutSponsorship = children.filter(child => 
    !sponsorships.some(s => s.child_id === child.id)
  );

  // Filter out sponsors who already have a sponsorship
  const availableSponsors = allSponsors.filter(sponsor => 
    !sponsorships.some(s => s.sponsor_id === sponsor.id)
  );

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setIsFormOpen(true);
  };

  const handleSponsorSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsFormOpen(true);
  };

  const renderChildrenTable = (childrenList: Child[], title: string, emptyMessage: string) => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {childrenList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              childrenList.map((child) => (
                <TableRow 
                  key={child.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleChildSelect(child)}
                >
                  <TableCell>{child.name}</TableCell>
                  <TableCell>{child.age} años</TableCell>
                  <TableCell>{child.location}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sponsorships.some(s => s.child_id === child.id)
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {sponsorships.some(s => s.child_id === child.id)
                        ? "Apadrinado"
                        : "Pendiente"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

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

      <div className="space-y-6">
        {/* Lista de Niños sin Padrinos */}
        {renderChildrenTable(
          childrenWithoutSponsorship,
          "Niños sin Padrinos",
          "No hay niños sin padrinos asignados"
        )}

        {/* Lista de Padrinos Disponibles */}
        <AvailableSponsorsTable
          sponsors={availableSponsors}
          onSponsorSelect={handleSponsorSelect}
          isLoading={isLoadingSponsors || isLoadingSponsorships}
        />

        {/* Separador destacado */}
        <div className="relative py-8">
          <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
          <div className="relative z-10 flex justify-center">
            <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Apadrinamientos Activos
            </span>
          </div>
        </div>

        {/* Lista de Niños con Padrinos */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-primary">
          {renderChildrenTable(
            childrenWithSponsorship,
            "Niños con Padrinos",
            "No hay niños con padrinos asignados"
          )}
        </div>
      </div>
    </div>
  );
};

export default Management;