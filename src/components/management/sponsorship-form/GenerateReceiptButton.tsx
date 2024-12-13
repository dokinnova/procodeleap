import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Child, Sponsor } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingReceipt, setExistingReceipt] = useState<any>(null);

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
        setExistingReceipt(existingReceipt);
        setShowConfirmDialog(true);
        return;
      }

      await createReceipt();
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el recibo",
        variant: "destructive",
      });
    }
  };

  const createReceipt = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { error } = await supabase
        .from("receipts")
        .insert([
          {
            sponsorship_id: existingSponsorship.id,
            amount: selectedSponsor?.contribution,
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
      console.error("Error creating receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el recibo",
        variant: "destructive",
      });
    }
  };

  const handleConfirmGenerate = async () => {
    await createReceipt();
    setShowConfirmDialog(false);
  };

  return (
    <>
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

      <DeleteConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmGenerate}
        title="¿Generar recibo adicional?"
        description={`Ya existe un recibo generado para este mes. ¿Deseas generar otro recibo?`}
      />
    </>
  );
};