import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Receipt {
  id: string;
  amount: number;
  sponsorship: {
    sponsor: {
      name: string;
    };
    child: {
      name: string;
    };
  };
}

interface ReceiptsTableProps {
  receipts: Receipt[];
  totalAmount: number;
}

export const ReceiptsTable = ({ receipts, totalAmount }: ReceiptsTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

  const handleDelete = async () => {
    if (!receiptToDelete) return;

    try {
      const { error } = await supabase
        .from("receipts")
        .delete()
        .eq("id", receiptToDelete.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Recibo eliminado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el recibo",
        variant: "destructive",
      });
    } finally {
      setReceiptToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Padrino</TableHead>
            <TableHead>Niño</TableHead>
            <TableHead className="text-right">Importe</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell>{receipt.sponsorship.sponsor.name}</TableCell>
              <TableCell>{receipt.sponsorship.child.name}</TableCell>
              <TableCell className="text-right">${receipt.amount}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setReceiptToDelete(receipt)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">${totalAmount}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <DeleteConfirmationDialog
        isOpen={!!receiptToDelete}
        onClose={() => setReceiptToDelete(null)}
        onConfirm={handleDelete}
        title="¿Estás seguro?"
        description={`Esta acción eliminará permanentemente el recibo del padrino ${receiptToDelete?.sponsorship.sponsor.name}.`}
      />
    </>
  );
};