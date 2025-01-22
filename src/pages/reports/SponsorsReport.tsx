import { useQuery } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SponsorsFilter } from "@/components/reports/sponsors/SponsorsFilter";
import { SponsorsTable } from "@/components/reports/sponsors/SponsorsTable";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SponsorsReport = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sponsors = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sponsors-report"],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de padrinos...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No hay sesión activa');
          navigate('/auth');
          throw new Error('No hay sesión activa');
        }

        console.log('Sesión activa:', session);
        console.log('Token de autenticación:', session.access_token);

        const { data, error } = await supabase
          .from("sponsors")
          .select("*")
          .order('name');
        
        if (error) {
          console.error('Error al obtener padrinos:', error);
          throw error;
        }
        
        console.log('Respuesta de Supabase:', { data, error });
        console.log('Número de padrinos obtenidos:', data?.length || 0);
        console.log('Padrinos obtenidos:', data);
        return data || [];
      } catch (error: any) {
        console.error('Error en la consulta:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los padrinos. Por favor, intenta de nuevo.",
        });
        throw error;
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error('Error en la consulta:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los padrinos. Por favor, intenta de nuevo.",
        });
      }
    }
  });

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
          <CardDescription>Obteniendo datos del reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudieron cargar los datos del reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Hubo un problema al conectar con el servidor'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline" className="w-full">
            Reintentar
          </Button>
        </CardContent>
      </Card>
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
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <SponsorsTable sponsors={filteredSponsors} />
    </div>
  );
};

export default SponsorsReport;