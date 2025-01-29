import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCardForm } from "./CreditCardForm";
import { BankTransferForm } from "./BankTransferForm";
import { PayPalForm } from "./PayPalForm";

interface PaymentMethodFormProps {
  onSubmit: (formData: {
    method: string;
    bankName?: string;
    accountNumber?: string;
    cardHolder?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    paypalEmail?: string;
  }) => void;
}

export const PaymentMethodForm = ({ onSubmit }: PaymentMethodFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: any = { method: selectedMethod };

    switch (selectedMethod) {
      case "bank_transfer":
        formData.bankName = bankName;
        formData.accountNumber = accountNumber;
        break;
      case "credit_card":
        formData.cardHolder = cardHolder;
        formData.cardNumber = cardNumber;
        formData.cardExpiry = cardExpiry;
        formData.cardCvv = cardCvv;
        break;
      case "paypal":
        formData.paypalEmail = paypalEmail;
        break;
    }

    onSubmit(formData);

    // Reset form
    setSelectedMethod("");
    setBankName("");
    setAccountNumber("");
    setCardHolder("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setPaypalEmail("");
  };

  const renderPaymentMethodFields = () => {
    switch (selectedMethod) {
      case "bank_transfer":
        return (
          <BankTransferForm
            bankName={bankName}
            accountNumber={accountNumber}
            onBankNameChange={setBankName}
            onAccountNumberChange={setAccountNumber}
          />
        );
      case "credit_card":
        return (
          <CreditCardForm
            cardHolder={cardHolder}
            cardNumber={cardNumber}
            cardExpiry={cardExpiry}
            cardCvv={cardCvv}
            onCardHolderChange={setCardHolder}
            onCardNumberChange={setCardNumber}
            onCardExpiryChange={setCardExpiry}
            onCardCvvChange={setCardCvv}
          />
        );
      case "paypal":
        return (
          <PayPalForm
            paypalEmail={paypalEmail}
            onPaypalEmailChange={setPaypalEmail}
          />
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