import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PaymentMethodsFormProps {
  sponsorId: string;
}

export const PaymentMethodsForm = ({ sponsorId }: PaymentMethodsFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
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
        method: selectedMethod,
        is_default: paymentMethods.length === 0,
      };

      switch (selectedMethod) {
        case "bank_transfer":
          paymentData.bank_name = bankName;
          paymentData.account_number = accountNumber;
          break;
        case "credit_card":
          paymentData.card_last_four = cardLastFour;
          break;
        case "paypal":
          paymentData.paypal_email = paypalEmail;
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

      // Reset form
      setSelectedMethod("");
      setBankName("");
      setAccountNumber("");
      setCardLastFour("");
      setPaypalEmail("");

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

  const renderPaymentMethodFields = () => {
    switch (selectedMethod) {
      case "bank_transfer":
        return (
          <>
            <div className="space-y-2">
              <Label>Nombre del banco</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Nombre del banco"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de cuenta</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Número de cuenta"
              />
            </div>
          </>
        );
      case "credit_card":
        return (
          <div className="space-y-2">
            <Label>Últimos 4 dígitos</Label>
            <Input
              value={cardLastFour}
              onChange={(e) => setCardLastFour(e.target.value)}
              placeholder="Últimos 4 dígitos"
              maxLength={4}
            />
          </div>
        );
      case "paypal":
        return (
          <div className="space-y-2">
            <Label>Email de PayPal</Label>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="Email de PayPal"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Método de pago</Label>
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
              <SelectItem value="credit_card">Tarjeta de crédito</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderPaymentMethodFields()}

        <Button type="submit" className="w-full">
          Agregar método de pago
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="font-medium">Métodos de pago registrados</h3>
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">
                {method.method === "bank_transfer" && "Transferencia bancaria"}
                {method.method === "credit_card" && "Tarjeta de crédito"}
                {method.method === "paypal" && "PayPal"}
                {method.method === "cash" && "Efectivo"}
                {method.is_default && (
                  <span className="ml-2 text-sm text-primary">(Principal)</span>
                )}
              </p>
              {method.bank_name && (
                <p className="text-sm text-gray-600">
                  Banco: {method.bank_name}
                </p>
              )}
              {method.account_number && (
                <p className="text-sm text-gray-600">
                  Cuenta: {method.account_number}
                </p>
              )}
              {method.card_last_four && (
                <p className="text-sm text-gray-600">
                  Tarjeta: ****{method.card_last_four}
                </p>
              )}
              {method.paypal_email && (
                <p className="text-sm text-gray-600">
                  Email: {method.paypal_email}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(method.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};