import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SponsorsFilter } from "@/components/reports/sponsors/SponsorsFilter";
import { SponsorsTable } from "@/components/reports/sponsors/SponsorsTable";
import { useToast } from "@/hooks/use-toast";
import { Sponsor } from "@/types";

const SponsorsReport = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  const { data: sponsors = [], isLoading, error } = useQuery({
    queryKey: ["sponsors-report"],
    queryFn: async () => {
      console.log("Iniciando fetch de sponsors para reporte...");
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching sponsors:", error);
        toast({
          title: "Error al cargar los datos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log("Sponsors obtenidos exitosamente:", data?.length, "registros");
      console.log("Datos de sponsors:", data);
      return data as Sponsor[];
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-red-500">Error al cargar los datos</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  const dateRanges = [
    { label: "Último mes", days: 30 },
    { label: "Últimos 3 meses", days: 90 },
    { label: "Últimos 6 meses", days: 180 },
    { label: "Último año", days: 365 },
  ];

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(search.toLowerCase());

    if (dateFilter === "all") return matchesSearch;

    const range = dateRanges.find(r => r.label === dateFilter);
    if (!range) return matchesSearch;

    const startDate = new Date(sponsor.created_at);
    const daysAgo = (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return matchesSearch && daysAgo <= range.days;
  });

  console.log("Sponsors filtrados:", filteredSponsors);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Listado de Padrinos</h1>
        </div>
        <Button onClick={() => window.print()} variant="outline">
          Imprimir Reporte
        </Button>
      </div>

      <SponsorsFilter
        search={search}
        onSearchChange={setSearch}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <SponsorsTable sponsors={filteredSponsors} />
    </div>
  );
};

export default SponsorsReport;