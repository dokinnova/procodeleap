
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Child, Sponsor } from "@/types";

interface DeleteSponsorshipButtonProps {
  selectedChild: Child | null;
  selectedSponsor: Sponsor | null;
  onDelete: () => Promise<void>;
}

export const DeleteSponsorshipButton = ({
  selectedChild,
  selectedSponsor,
  onDelete,
}: DeleteSponsorshipButtonProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" type="button">
        Eliminar Apadrinamiento
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción eliminará permanentemente el apadrinamiento entre {selectedChild?.name} y {selectedSponsor ? `${selectedSponsor.first_name} ${selectedSponsor.last_name}` : ''}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600"
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
