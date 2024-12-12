import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethodFormProps {
  onSubmit: (formData: {
    method: string;
    bankName?: string;
    accountNumber?: string;
    cardLastFour?: string;
    paypalEmail?: string;
  }) => void;
}

export const PaymentMethodForm = ({ onSubmit }: PaymentMethodFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method: selectedMethod,
      bankName: selectedMethod === "bank_transfer" ? bankName : undefined,
      accountNumber: selectedMethod === "bank_transfer" ? accountNumber : undefined,
      cardLastFour: selectedMethod === "credit_card" ? cardLastFour : undefined,
      paypalEmail: selectedMethod === "paypal" ? paypalEmail : undefined,
    });

    // Reset form
    setSelectedMethod("");
    setBankName("");
    setAccountNumber("");
    setCardLastFour("");
    setPaypalEmail("");
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
  );
};