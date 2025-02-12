
import { Button } from "@/components/ui/button";
import { Sponsor } from "@/types";

interface SponsorFormActionsProps {
  selectedSponsor: Sponsor | null;
  onDeleteClick: () => void;
  onCancel: () => void;
}

export const SponsorFormActions = ({
  selectedSponsor,
  onDeleteClick,
  onCancel,
}: SponsorFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      {selectedSponsor && (
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={onDeleteClick}
          className="px-8"
        >
          Eliminar Padrino
        </Button>
      )}
      <Button type="button" variant="outline" size="lg" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" size="lg">
        {selectedSponsor ? "Actualizar" : "Registrar"}
      </Button>
    </div>
  );
};
