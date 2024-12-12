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
import { CreditCard, Banknote } from "lucide-react";

interface PaymentMethodFormProps {
  onSubmit: (data: {
    method: string;
    bankName?: string;
    accountNumber?: string;
    cardLastFour?: string;
  }) => void;
}

export const PaymentMethodForm = ({ onSubmit }: PaymentMethodFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      method: selectedMethod,
      bankName: selectedMethod === "bank_transfer" ? bankName : undefined,
      accountNumber: selectedMethod === "bank_transfer" ? accountNumber : undefined,
      cardLastFour: selectedMethod === "credit_card" ? cardLastFour : undefined,
    });

    // Reset form
    setSelectedMethod("");
    setBankName("");
    setAccountNumber("");
    setCardLastFour("");
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
            <SelectItem value="bank_transfer" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                <span>Transferencia bancaria</span>
              </div>
            </SelectItem>
            <SelectItem value="credit_card" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Tarjeta de crédito</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedMethod === "bank_transfer" && (
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
      )}

      {selectedMethod === "credit_card" && (
        <div className="space-y-2">
          <Label>Últimos 4 dígitos</Label>
          <Input
            value={cardLastFour}
            onChange={(e) => setCardLastFour(e.target.value)}
            placeholder="Últimos 4 dígitos"
            maxLength={4}
          />
        </div>
      )}

      <Button type="submit" className="w-full">
        Agregar método de pago
      </Button>
    </form>
  );
};