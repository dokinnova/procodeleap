
import { Check, MoreVertical, Pencil, Trash } from "lucide-react";
import { Task } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (completed: boolean) => void;
}

export const TaskActions = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskActionsProps) => {
  const isCompleted = task.status === "completed";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Acciones</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onStatusChange(!isCompleted)}>
          <Check className="h-4 w-4 mr-2" />
          {isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(task)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onDelete(task)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
