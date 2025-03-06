
import { Task } from "@/types";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

interface TaskDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  task: Task | null;
}

export const TaskDeleteDialog = ({ isOpen, onClose, onConfirm, task }: TaskDeleteDialogProps) => {
  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="¿Eliminar esta tarea?"
      description="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta tarea?"
    />
  );
};
