
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export const TaskFormActions = ({ isEditing, onCancel }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEditing ? "Actualizar" : "Crear"} Tarea
      </Button>
    </div>
  );
};
