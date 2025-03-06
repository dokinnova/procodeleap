
import { useState } from "react";
import { Check, Pencil, Plus, Filter, Trash2, CalendarRange } from "lucide-react";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface TasksListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onTasksUpdated: () => void;
}

export const TasksList = ({ tasks, onTaskSelect, onTasksUpdated }: TasksListProps) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Tareas</CardTitle>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Estado</h4>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-all" 
                        checked={filter === 'all'} 
                        onCheckedChange={() => setFilter('all')}
                      />
                      <label htmlFor="filter-all">Todas</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-pending" 
                        checked={filter === 'pending'} 
                        onCheckedChange={() => setFilter('pending')}
                      />
                      <label htmlFor="filter-pending">Pendientes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-completed" 
                        checked={filter === 'completed'} 
                        onCheckedChange={() => setFilter('completed')}
                      />
                      <label htmlFor="filter-completed">Completadas</label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => onTaskSelect({ title: '', description: '', status: 'pending' } as Task)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            {filter === 'all' ? 'No hay tareas registradas' : 
             filter === 'pending' ? 'No hay tareas pendientes' : 'No hay tareas completadas'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="border p-4 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox 
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => handleStatusChange(task, checked as boolean)}
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
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onTaskSelect(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => confirmDelete(task)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta tarea?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta tarea?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
