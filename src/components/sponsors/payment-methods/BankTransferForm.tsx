import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankTransferFormProps {
  bankName: string;
  accountNumber: string;
  onBankNameChange: (value: string) => void;
  onAccountNumberChange: (value: string) => void;
}

export const BankTransferForm = ({
  bankName,
  accountNumber,
  onBankNameChange,
  onAccountNumberChange,
}: BankTransferFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del banco</Label>
        <Input
          value={bankName}
          onChange={(e) => onBankNameChange(e.target.value)}
          placeholder="Nombre del banco"
        />
      </div>
      <div className="space-y-2">
        <Label>Número de cuenta</Label>
        <Input
          value={accountNumber}
          onChange={(e) => onAccountNumberChange(e.target.value)}
          placeholder="Número de cuenta"
        />
      </div>
    </div>
  );
};