import { useQuery } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SponsorsFilter } from "@/components/reports/sponsors/SponsorsFilter";
import { SponsorsTable } from "@/components/reports/sponsors/SponsorsTable";

const SponsorsReport = () => {
  const [search, setSearch] = useState("");
  const [contributionFilter, setContributionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sponsors = [], isLoading, error } = useQuery({
    queryKey: ["sponsors-report"],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de padrinos para reporte...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No hay sesión activa');
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión nuevamente",
            variant: "destructive",
          });
          navigate('/auth');
          return [];
        }

        console.log('Sesión activa:', session.user.email);
        const { data, error } = await supabase
          .from("sponsors")
          .select("*")
          .order('name');

        if (error) {
          console.error('Error al obtener padrinos:', error);
          throw error;
        }

        console.log('Datos obtenidos:', data);
        return data || [];
      } catch (error: any) {
        console.error('Error en la consulta de padrinos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los padrinos",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const contributionRanges = [
    { label: "Menos de $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Más de $200", min: 200, max: Infinity },
  ];

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ];

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(search.toLowerCase()) ||
                         sponsor.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesContribution = contributionFilter === "all" ? true :
      (() => {
        const range = contributionRanges.find(r => r.label === contributionFilter);
        return range && sponsor.contribution >= range.min && sponsor.contribution < range.max;
      })();

    const matchesStatus = statusFilter === "all" ? true : sponsor.status === statusFilter;
    
    return matchesSearch && matchesContribution && matchesStatus;
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
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Hubo un problema al conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
        contributionFilter={contributionFilter}
        onContributionFilterChange={setContributionFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <SponsorsTable 
        sponsors={filteredSponsors}
        statusOptions={statusOptions}
      />
    </div>
  );
};

export default SponsorsReport;