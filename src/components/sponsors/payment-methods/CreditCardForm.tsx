import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditCardFormProps {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  onCardHolderChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCvvChange: (value: string) => void;
}

export const CreditCardForm = ({
  cardHolder,
  cardNumber,
  cardExpiry,
  cardCvv,
  onCardHolderChange,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvvChange,
}: CreditCardFormProps) => {
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del titular</Label>
        <Input
          value={cardHolder}
          onChange={(e) => onCardHolderChange(e.target.value)}
          placeholder="Nombre como aparece en la tarjeta"
        />
      </div>
      <div className="space-y-2">
        <Label>Número de tarjeta</Label>
        <Input
          value={cardNumber}
          onChange={(e) => onCardNumberChange(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de vencimiento</Label>
          <Input
            value={cardExpiry}
            onChange={(e) => onCardExpiryChange(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label>CVV</Label>
          <Input
            value={cardCvv}
            onChange={(e) => onCardCvvChange(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            maxLength={4}
            type="password"
          />
        </div>
      </div>
    </div>
  );
};