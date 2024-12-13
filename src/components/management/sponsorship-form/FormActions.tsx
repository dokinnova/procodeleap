import { Button } from "@/components/ui/button";
import { DeleteSponsorshipButton } from "./DeleteSponsorshipButton";
import { Child, Sponsor } from "@/types";

interface FormActionsProps {
  existingSponsorship: any;
  isSubmitting: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  selectedChild: Child | null;
  selectedSponsor: Sponsor | null;
}

export const FormActions = ({
  existingSponsorship,
  isSubmitting,
  onClose,
  onDelete,
  selectedChild,
  selectedSponsor,
}: FormActionsProps) => (
  <div className="flex justify-end gap-2">
    {existingSponsorship && (
      <DeleteSponsorshipButton
        selectedChild={selectedChild}
        selectedSponsor={selectedSponsor}
        onDelete={onDelete}
      />
    )}
    <Button variant="outline" onClick={onClose} type="button">
      Cancelar
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {existingSponsorship ? "Actualizar" : "Crear"}
    </Button>
  </div>
);