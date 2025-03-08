
import { CalendarClock, ChevronDown, Edit, Trash, User } from "lucide-react";
import { Task, formatDate } from "@/types";
import { TaskStatusBadge } from "../TaskStatusBadge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { TaskActions } from "./TaskActions";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onStatusChange: (task: Task, completed: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskItem = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCompleted = task.status === "completed";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "border rounded-lg bg-white shadow-sm",
        isCompleted ? "bg-gray-50" : ""
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <TaskStatusBadge status={task.status} />
          <h3
            className={cn(
              "font-medium truncate flex-1",
              isCompleted ? "text-gray-500 line-through" : "text-gray-900"
            )}
          >
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
              <CalendarClock className="h-4 w-4" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}

          {task.assigned_user && (
            <div className="hidden md:flex items-center gap-1 text-sm text-blue-600">
              <User className="h-4 w-4" />
              <span>{task.assigned_user.email}</span>
            </div>
          )}

          <TaskActions
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={(completed) => onStatusChange(task, completed)}
          />

          <CollapsibleTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isOpen ? "transform rotate-180" : ""
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            {task.due_date && (
              <div className="md:hidden flex items-center gap-1 text-sm text-gray-500">
                <CalendarClock className="h-4 w-4" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
            
            {task.assigned_user && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <User className="h-4 w-4" />
                <span>Asignada a: {task.assigned_user.email}</span>
              </div>
            )}

            {task.related_to && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>
                  Relacionada con:{" "}
                  {task.related_to === "child"
                    ? task.child?.name
                    : task.sponsor?.name}
                </span>
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mt-2">{task.description}</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
