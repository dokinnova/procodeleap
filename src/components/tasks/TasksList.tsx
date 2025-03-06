
import { Plus } from "lucide-react";
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "./task-list/TaskFilters";
import { TaskItem } from "./task-list/TaskItem";
import { TaskListEmptyState } from "./task-list/TaskListEmptyState";
import { TaskDeleteDialog } from "./task-list/TaskDeleteDialog";
import { useTasksList } from "./task-list/useTasksList";

interface TasksListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onTasksUpdated: () => void;
}

export const TasksList = ({ tasks, onTaskSelect, onTasksUpdated }: TasksListProps) => {
  const {
    filter,
    setFilter,
    filteredTasks,
    handleStatusChange,
    handleDelete,
    confirmDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    taskToDelete
  } = useTasksList({ tasks, onTaskSelect, onTasksUpdated });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Tareas</CardTitle>
        <div className="flex space-x-2">
          <TaskFilters filter={filter} setFilter={setFilter} />
          
          <Button onClick={() => onTaskSelect({ title: '', description: '', status: 'pending' } as Task)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <TaskListEmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={onTaskSelect}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </CardContent>

      <TaskDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        task={taskToDelete}
      />
    </Card>
  );
};
