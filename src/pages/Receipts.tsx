import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Download } from "lucide-react";
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
              name,
              email
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

  const generateBankFile = () => {
    if (receipts.length === 0) {
      toast({
        title: "Error",
        description: "No hay recibos para generar el fichero",
        variant: "destructive",
      });
      return;
    }

    // Format date as DDMMYY
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '');

    // Header record (1)
    let content = "5180" + // Código registro
                 "19" +    // Código de operación (adeudos SEPA)
                 "72" +    // Código de dato
                 formattedDate + // Fecha confección
                 "".padEnd(6, " ") + // Libre
                 "".padEnd(40, " ") + // Nombre del ordenante
                 "".padEnd(20, " ") + // Libre
                 "2" +     // Procedimiento
                 "\r\n";

    // Individual records
    receipts.forEach((receipt, index) => {
      const referenceNumber = (index + 1).toString().padStart(12, "0");
      const amount = (Number(receipt.amount) * 100).toString().padStart(10, "0"); // Convert to cents
      const sponsorName = receipt.sponsorship.sponsor.name.padEnd(40, " ").substring(0, 40);

      content += "5380" + // Código registro
                "19" +   // Código de operación
                "72" +   // Código de dato
                referenceNumber + // Referencia
                sponsorName +    // Nombre del titular de domiciliación
                amount +         // Importe
                formattedDate +  // Fecha de cobro
                "".padEnd(2, " ") + // Libre
                "\r\n";
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibos_${selectedMonth}_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Éxito",
      description: "Fichero bancario generado correctamente",
    });
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recibos Emitidos</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateBankFile}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Generar Fichero Bancario
          </Button>
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
        <h3 className="text-lg font-semibold">Generar recibos de padrinos activos</h3>
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
