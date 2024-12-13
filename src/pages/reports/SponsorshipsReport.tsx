import { useQuery } from "@tanstack/react-query";
import { BarChart2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const SponsorshipsReport = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ["sponsorships-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorships")
        .select(`
          *,
          child:children (
            name,
            age,
            location
          ),
          sponsor:sponsors (
            name,
            contribution
          )
        `)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const dateRanges = [
    { label: "Último mes", days: 30 },
    { label: "Últimos 3 meses", days: 90 },
    { label: "Últimos 6 meses", days: 180 },
    { label: "Último año", days: 365 },
  ];

  const filteredSponsorships = sponsorships.filter(sponsorship => {
    const matchesSearch = 
      sponsorship.child?.name.toLowerCase().includes(search.toLowerCase()) ||
      sponsorship.sponsor?.name.toLowerCase().includes(search.toLowerCase());

    if (dateFilter === "all") return matchesSearch;

    const range = dateRanges.find(r => r.label === dateFilter);
    if (!range) return matchesSearch;

    const startDate = new Date(sponsorship.start_date);
    const daysAgo = (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return matchesSearch && daysAgo <= range.days;
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
          <BarChart2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Niños con Padrinos</h1>
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
            placeholder="Buscar por nombre del niño o padrino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              {dateRanges.map((range) => (
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
              <TableHead>Niño</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Padrino</TableHead>
              <TableHead>Contribución</TableHead>
              <TableHead>Fecha de Inicio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsorships.map((sponsorship) => (
              <TableRow key={sponsorship.id}>
                <TableCell className="font-medium">{sponsorship.child?.name}</TableCell>
                <TableCell>{sponsorship.child?.age} años</TableCell>
                <TableCell>{sponsorship.child?.location}</TableCell>
                <TableCell>{sponsorship.sponsor?.name}</TableCell>
                <TableCell className="font-mono">
                  ${sponsorship.sponsor?.contribution.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /mes
                </TableCell>
                <TableCell>
                  {new Date(sponsorship.start_date).toLocaleDateString("es-ES")}
                </TableCell>
              </TableRow>
            ))}
            {filteredSponsorships.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No se encontraron apadrinamientos con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SponsorshipsReport;