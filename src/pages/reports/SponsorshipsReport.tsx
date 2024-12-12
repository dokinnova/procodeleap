import { useQuery } from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const SponsorshipsReport = () => {
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
            {sponsorships.map((sponsorship) => (
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SponsorshipsReport;