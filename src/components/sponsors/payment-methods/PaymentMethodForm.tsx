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
    cardNumber?: string;
    cardHolder?: string;
    cardExpiry?: string;
    cardCvv?: string;
    paypalEmail?: string;
  }) => void;
}

export const PaymentMethodForm = ({ onSubmit }: PaymentMethodFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method: selectedMethod,
      bankName: selectedMethod === "bank_transfer" ? bankName : undefined,
      accountNumber: selectedMethod === "bank_transfer" ? accountNumber : undefined,
      cardNumber: selectedMethod === "credit_card" ? cardNumber : undefined,
      cardHolder: selectedMethod === "credit_card" ? cardHolder : undefined,
      cardExpiry: selectedMethod === "credit_card" ? cardExpiry : undefined,
      cardCvv: selectedMethod === "credit_card" ? cardCvv : undefined,
      paypalEmail: selectedMethod === "paypal" ? paypalEmail : undefined,
    });

    // Reset form
    setSelectedMethod("");
    setBankName("");
    setAccountNumber("");
    setCardNumber("");
    setCardHolder("");
    setCardExpiry("");
    setCvv("");
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
          <>
            <div className="space-y-2">
              <Label>Nombre del titular</Label>
              <Input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Nombre como aparece en la tarjeta"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de tarjeta</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de vencimiento</Label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  value={cardCvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </>
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