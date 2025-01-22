import { useQuery } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SponsorsReport = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sponsors = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sponsors-report"],
    queryFn: async () => {
      try {
        console.log('Iniciando fetch de padrinos para reporte...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No hay sesión activa');
          throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
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

        if (!data) {
          console.log('No se encontraron padrinos');
          return [];
        }

        console.log('Padrinos obtenidos exitosamente:', data.length, 'registros');
        return data;
      } catch (error: any) {
        console.error('Error en la consulta de padrinos:', error);
        toast({
          title: "Error al cargar los datos",
          description: error.message || "Por favor, verifica tu conexión e intenta nuevamente",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: 1000 * 60 * 10, // 10 minutos
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
          <CardDescription>
            Obteniendo datos del reporte
          </CardDescription>
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
          <CardDescription>
            No se pudieron cargar los datos del reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Hubo un problema al conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => {
              console.log('Reintentando carga de datos...');
              refetch();
            }}
            variant="outline"
            className="w-full"
          >
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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            className="pl-10 bg-white"
            placeholder="Buscar por nombre..."
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

      <Card>
        <CardHeader>
          <CardTitle>Reporte de Padrinos</CardTitle>
          <CardDescription>
            Listado completo de padrinos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contribución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSponsors.map((sponsor) => (
                    <tr key={sponsor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{sponsor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sponsor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sponsor.phone || 'No disponible'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        ${sponsor.contribution.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}/mes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sponsor.status === 'active' ? 'Activo' : 
                         sponsor.status === 'inactive' ? 'Inactivo' : 
                         sponsor.status === 'pending' ? 'Pendiente' : sponsor.status}
                      </td>
                    </tr>
                  ))}
                  {filteredSponsors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No se encontraron padrinos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SponsorsReport;