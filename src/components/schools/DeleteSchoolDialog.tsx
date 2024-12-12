import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { School } from "@/pages/Schools";

interface DeleteSchoolDialogProps {
  school: School | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (schoolId: string) => Promise<void>;
}

export const DeleteSchoolDialog = ({
  school,
  onOpenChange,
  onConfirmDelete,
}: DeleteSchoolDialogProps) => {
  if (!school) return null;

  return (
    <AlertDialog open={!!school} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el colegio {school.name}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onConfirmDelete(school.id)}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};