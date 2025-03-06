
import { CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types";
import { TaskStatusBadge } from "../TaskStatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskActions } from "./TaskActions";

interface TaskItemProps {
  task: Task;
  onStatusChange: (task: Task, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskItem = ({ task, onStatusChange, onEdit, onDelete }: TaskItemProps) => {
  return (
    <div 
      className="border p-4 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
    >
      <div className="flex items-start gap-3 flex-1">
        <Checkbox 
          checked={task.status === 'completed'}
          onCheckedChange={(checked) => onStatusChange(task, checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {task.due_date && (
              <div className="flex items-center mr-4">
                <CalendarRange className="h-3.5 w-3.5 mr-1" />
                {format(new Date(task.due_date), "dd MMM yyyy", { locale: es })}
              </div>
            )}
            
            {task.related_to === 'child' && task.child && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-2">
                Niño: {task.child.name}
              </span>
            )}
            
            {task.related_to === 'sponsor' && task.sponsor && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Padrino: {task.sponsor.first_name} {task.sponsor.last_name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};
