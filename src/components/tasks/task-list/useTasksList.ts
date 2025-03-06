
import { useState } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseTasksListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onTasksUpdated: () => void;
}

export const useTasksList = ({ tasks, onTaskSelect, onTasksUpdated }: UseTasksListProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const handleStatusChange = async (task: Task, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: completed ? 'completed' : 'pending',
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: completed ? "Tarea completada" : "Tarea marcada como pendiente",
        description: task.title,
      });
      
      onTasksUpdated();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Tarea eliminada",
        description: taskToDelete.title,
      });
      
      setShowDeleteDialog(false);
      setTaskToDelete(null);
      onTasksUpdated();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  return {
    filter,
    setFilter,
    filteredTasks,
    handleStatusChange,
    handleDelete,
    confirmDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    taskToDelete
  };
};
