
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { useDeleteSponsor } from "@/hooks/useDeleteSponsor";
import { Sponsor } from "@/types";
import { SponsorFormFields } from "./form/SponsorFormFields";
import { SponsorFormActions } from "./form/SponsorFormActions";
import { useSponsorForm } from "./form/useSponsorForm";

interface SponsorFormProps {
  selectedSponsor: Sponsor | null;
  onSubmit: (data: any, isEditing: boolean) => Promise<boolean>;
  onCancel: () => void;
}

export const SponsorForm = ({ selectedSponsor, onSubmit, onCancel }: SponsorFormProps) => {
  const { register, handleSubmit, setValue, watch } = useSponsorForm(selectedSponsor);
  const { sponsorToDelete, setSponsorToDelete, handleDelete } = useDeleteSponsor();

  const handleDeleteClick = () => {
    if (selectedSponsor) {
      setSponsorToDelete(selectedSponsor);
    }
  };

  const handleConfirmDelete = async () => {
    if (sponsorToDelete) {
      await handleDelete(sponsorToDelete.id);
      onCancel();
    }
  };

  const handleFormSubmit = (formData: any) => {
    return onSubmit(formData, !!selectedSponsor);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            {selectedSponsor ? "Editar Padrino" : "Registrar Nuevo Padrino"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <SponsorFormFields
              register={register}
              setValue={setValue}
              watch={watch}
            />
            <SponsorFormActions
              selectedSponsor={selectedSponsor}
              onDeleteClick={handleDeleteClick}
              onCancel={onCancel}
            />
          </form>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={!!sponsorToDelete}
        onClose={() => setSponsorToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el padrino ${sponsorToDelete?.first_name} ${sponsorToDelete?.last_name}.`}
      />
    </>
  );
};
