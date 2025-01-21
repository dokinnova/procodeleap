import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ChildrenReport = () => {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ["children-report"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("children")
          .select(`
            *,
            schools (
              name
            )
          `)
          .order("name");
        
        if (error) {
          console.error('Error fetching children:', error);
          toast({
            title: "Error al cargar los datos",
            description: "Por favor, intenta nuevamente en unos momentos",
            variant: "destructive",
          });
          throw error;
        }

        if (!data) {
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error in query function:', error);
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const uniqueLocations = [...new Set(children.map(child => child.location))];

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === "all" || child.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const handleChildSelect = (child: Child) => {
    navigate('/children', { 
      state: { 
        selectedChild: {
          ...child,
          birth_date: child.birth_date || format(new Date(), 'yyyy-MM-dd'),
          story: child.story || '',
          school_id: child.school_id || '',
          grade: child.grade || '',
        } 
      } 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <p className="text-lg text-red-500">Error al cargar los datos</p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Listado de Niños</h1>
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
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
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
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Colegio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChildren.map((child) => (
              <TableRow 
                key={child.id}
                onClick={() => handleChildSelect(child)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{child.age} años</TableCell>
                <TableCell>{child.location}</TableCell>
                <TableCell>{child.schools?.name || "No asignado"}</TableCell>
              </TableRow>
            ))}
            {filteredChildren.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No se encontraron niños con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ChildrenReport;