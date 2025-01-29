import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PayPalFormProps {
  paypalEmail: string;
  onPaypalEmailChange: (value: string) => void;
}

export const PayPalForm = ({
  paypalEmail,
  onPaypalEmailChange,
}: PayPalFormProps) => {
  return (
    <div className="space-y-2">
      <Label>Email de PayPal</Label>
      <Input
        type="email"
        value={paypalEmail}
        onChange={(e) => onPaypalEmailChange(e.target.value)}
        placeholder="Email de PayPal"
      />
    </div>
  );
};