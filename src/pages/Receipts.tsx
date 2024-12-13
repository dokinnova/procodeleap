import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ReceiptFilters } from "@/components/receipts/ReceiptFilters";
import { ReceiptsTable } from "@/components/receipts/ReceiptsTable";
import { SponsorshipsList } from "@/components/receipts/SponsorshipsList";
import { BankFileGenerator } from "@/components/receipts/BankFileGenerator";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Recibos</h2>
        <p className="text-muted-foreground">
          Genera y gestiona los recibos mensuales de los apadrinamientos
        </p>
      </div>

      <ReceiptFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recibos Emitidos</CardTitle>
          <BankFileGenerator receipts={receipts} />
        </CardHeader>
        <CardContent>
          <ReceiptsTable receipts={receipts} totalAmount={totalAmount} />
        </CardContent>
      </Card>

      <SponsorshipsList
        sponsorships={sponsorships}
        onGenerateReceipt={handleGenerateReceipt}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default Receipts;