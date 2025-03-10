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
      if (!sponsorId) return [];
      
      const { data } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("sponsor_id", sponsorId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: Boolean(sponsorId),
  });

  const handleSubmit = async (formData: any) => {
    if (!sponsorId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un padrino primero",
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

      // Agregar campos específicos según el método de pago
      switch (formData.method) {
        case "bank_transfer":
          paymentData.bank_name = formData.bankName;
          paymentData.account_number = formData.accountNumber;
          break;
        case "credit_card":
          // Solo guardamos los últimos 4 dígitos por seguridad
          paymentData.card_last_four = formData.cardNumber.slice(-4);
          break;
        case "paypal":
          paymentData.paypal_email = formData.paypalEmail;
          break;
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
    if (!sponsorId) return;

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

  if (!sponsorId) {
    return (
      <div className="space-y-6">
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          Selecciona un padrino para gestionar sus métodos de pago
        </div>
      </div>
    );
  }

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