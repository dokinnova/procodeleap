
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { TasksList } from "@/components/tasks/TasksList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, children(*), sponsors(*)")
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
  });

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setActiveTab("edit");
  };

  const handleTaskCreated = () => {
    refetch();
    setActiveTab("list");
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">Listado de Tareas</TabsTrigger>
          <TabsTrigger value="edit">
            {selectedTask ? "Editar Tarea" : "Nueva Tarea"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="animate-pulse text-lg text-gray-600">Cargando tareas...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              Error al cargar las tareas. Por favor, intente nuevamente.
            </div>
          ) : (
            <TasksList 
              tasks={tasks || []} 
              onTaskSelect={handleTaskSelect}
              onTasksUpdated={refetch}
            />
          )}
        </TabsContent>
        
        <TabsContent value="edit">
          <TaskForm 
            task={selectedTask} 
            onTaskSaved={handleTaskCreated}
            onCancel={() => {
              setSelectedTask(null);
              setActiveTab("list");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
