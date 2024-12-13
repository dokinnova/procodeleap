import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const SponsorsReport = () => {
  const [search, setSearch] = useState("");
  const [contributionFilter, setContributionFilter] = useState("");

  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ["sponsors-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const contributionRanges = [
    { label: "Menos de $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Más de $200", min: 200, max: Infinity },
  ];

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(search.toLowerCase()) ||
                         sponsor.email.toLowerCase().includes(search.toLowerCase());
    
    if (!contributionFilter) return matchesSearch;
    
    const range = contributionRanges.find(r => r.label === contributionFilter);
    const matchesContribution = range && 
      sponsor.contribution >= range.min && 
      sponsor.contribution < range.max;
    
    return matchesSearch && matchesContribution;
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Listado de Padrinos</h1>
        </div>
        <Button onClick={handlePrint} variant="outline">
          Imprimir Reporte
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 bg-white"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={contributionFilter} onValueChange={setContributionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por contribución" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las contribuciones</SelectItem>
              {contributionRanges.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Contribución</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsors.map((sponsor) => (
              <TableRow key={sponsor.id}>
                <TableCell className="font-medium">{sponsor.name}</TableCell>
                <TableCell>{sponsor.email}</TableCell>
                <TableCell>{sponsor.phone || "No disponible"}</TableCell>
                <TableCell className="font-mono">
                  ${sponsor.contribution.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /mes
                </TableCell>
              </TableRow>
            ))}
            {filteredSponsors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No se encontraron padrinos con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SponsorsReport;