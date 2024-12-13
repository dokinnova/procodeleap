import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Receipts = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

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

      <div className="grid gap-4">
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