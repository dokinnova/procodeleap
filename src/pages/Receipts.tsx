import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Receipts = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const { data: sponsorships = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ["sponsorships-with-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorships")
        .select(`
          *,
          sponsor:sponsors (
            id,
            name,
            contribution
          ),
          child:children (
            id,
            name
          )
        `);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["receipts", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select(`
          *,
          sponsorship:sponsorships (
            sponsor:sponsors (
              name
            ),
            child:children (
              name
            )
          )
        `)
        .eq("month", parseInt(selectedMonth))
        .eq("year", parseInt(selectedYear));

      if (error) throw error;
      return data || [];
    },
  });

  const totalAmount = receipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0);

  const handleGenerateReceipt = async (sponsorship: any) => {
    if (!sponsorship.sponsor) {
      toast({
        title: "Error",
        description: "No se encontró información del padrino",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      setIsGenerating(true);
      
      // Check if a receipt already exists for this month and year
      const { data: existingReceipts, error: queryError } = await supabase
        .from("receipts")
        .select("*")
        .eq("sponsorship_id", sponsorship.id)
        .eq("month", currentMonth)
        .eq("year", currentYear);

      if (queryError) throw queryError;

      if (existingReceipts && existingReceipts.length > 0) {
        toast({
          title: "Aviso",
          description: "Ya existe un recibo generado para este mes",
        });
        return;
      }

      // Create new receipt
      const { error: insertError } = await supabase
        .from("receipts")
        .insert([
          {
            sponsorship_id: sponsorship.id,
            amount: sponsorship.sponsor.contribution,
            month: currentMonth,
            year: currentYear,
          },
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Éxito",
        description: "Recibo generado correctamente",
      });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el recibo",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Recibos</h2>
        <p className="text-muted-foreground">
          Genera y gestiona los recibos mensuales de los apadrinamientos
        </p>
      </div>

      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recibos Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Padrino</TableHead>
                <TableHead>Niño</TableHead>
                <TableHead className="text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>{receipt.sponsorship.sponsor.name}</TableCell>
                  <TableCell>{receipt.sponsorship.child.name}</TableCell>
                  <TableCell className="text-right">${receipt.amount}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">${totalAmount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Generar Nuevos Recibos</h3>
        {sponsorships.map((sponsorship: any) => (
          <Card key={sponsorship.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Apadrinamiento: {sponsorship.sponsor?.name} - {sponsorship.child?.name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReceipt(sponsorship)}
                disabled={isGenerating}
                className="gap-2"
              >
                <Receipt className="w-4 h-4" />
                Generar Recibo
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monto mensual: ${sponsorship.sponsor?.contribution}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Receipts;