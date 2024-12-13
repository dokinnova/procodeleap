import { Button } from "@/components/ui/button";
import { ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Child, Sponsor } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface GenerateReceiptButtonProps {
  selectedChild: Child | null;
  selectedSponsor: Sponsor | null;
  existingSponsorship: any;
}

export const GenerateReceiptButton = ({
  selectedChild,
  selectedSponsor,
  existingSponsorship,
}: GenerateReceiptButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleGenerateReceipt = async () => {
    if (!existingSponsorship || !selectedSponsor) {
      toast({
        title: "Error",
        description: "No hay un apadrinamiento activo para generar el recibo",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      // Check if a receipt already exists for this month and year
      const { data: existingReceipt } = await supabase
        .from("receipts")
        .select("*")
        .eq("sponsorship_id", existingSponsorship.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      if (existingReceipt) {
        toast({
          title: "Aviso",
          description: "Ya existe un recibo generado para este mes",
        });
        return;
      }

      // Create new receipt
      const { error } = await supabase
        .from("receipts")
        .insert([
          {
            sponsorship_id: existingSponsorship.id,
            amount: selectedSponsor.contribution,
            month: currentMonth,
            year: currentYear,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Recibo generado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el recibo",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerateReceipt}
      disabled={!existingSponsorship || !selectedSponsor}
      className="gap-2"
    >
      <ReceiptText className="w-4 h-4" />
      Generar Recibo
    </Button>
  );
};