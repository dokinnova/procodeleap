
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskActions = ({ task, onEdit, onDelete }: TaskActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onEdit(task)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onDelete(task)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};
