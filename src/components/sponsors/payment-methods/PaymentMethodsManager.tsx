import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { PaymentMethodsList } from "./PaymentMethodsList";

interface PaymentMethodsManagerProps {
  sponsorId: string;
}

export const PaymentMethodsManager = ({ sponsorId }: PaymentMethodsManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment-methods", sponsorId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("sponsor_id", sponsorId)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleSubmit = async (formData: {
    method: string;
    bankName?: string;
    accountNumber?: string;
    cardLastFour?: string;
  }) => {
    if (!formData.method) {
      toast({
        title: "Error",
        description: "Por favor selecciona un método de pago",
        variant: "destructive",
      });
      return;
    }

    try {
      const paymentData: any = {
        sponsor_id: sponsorId,
        method: formData.method,
        is_default: paymentMethods.length === 0,
      };

      if (formData.method === "bank_transfer") {
        paymentData.bank_name = formData.bankName;
        paymentData.account_number = formData.accountNumber;
      } else if (formData.method === "credit_card") {
        paymentData.card_last_four = formData.cardLastFour;
      }

      const { error } = await supabase
        .from("payment_methods")
        .insert([paymentData]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Método de pago agregado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el método de pago",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Método de pago eliminado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PaymentMethodForm onSubmit={handleSubmit} />
      {paymentMethods.length > 0 && (
        <PaymentMethodsList
          paymentMethods={paymentMethods}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};