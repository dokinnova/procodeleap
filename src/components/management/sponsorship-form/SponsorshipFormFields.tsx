import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SponsorshipFormFieldsProps {
  startDate: string;
  notes: string;
  onStartDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export const SponsorshipFormFields = ({
  startDate,
  notes,
  onStartDateChange,
  onNotesChange,
}: SponsorshipFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="startDate">Fecha de inicio *</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          placeholder="Notas adicionales"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </>
  );
};