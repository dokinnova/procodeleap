
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
      try {
        // First fetch the basic task data
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("due_date", { ascending: true });
        
        if (tasksError) throw tasksError;
        
        // Fetch child data for tasks that have child_id
        const childIds = tasksData
          .filter(task => task.child_id)
          .map(task => task.child_id);
          
        const { data: childrenData } = await supabase
          .from("children")
          .select("*")
          .in("id", childIds.length > 0 ? childIds : ['00000000-0000-0000-0000-000000000000']);
          
        // Fetch sponsor data for tasks that have sponsor_id
        const sponsorIds = tasksData
          .filter(task => task.sponsor_id)
          .map(task => task.sponsor_id);
          
        const { data: sponsorsData } = await supabase
          .from("sponsors")
          .select("*")
          .in("id", sponsorIds.length > 0 ? sponsorIds : ['00000000-0000-0000-0000-000000000000']);
          
        // Fetch user data for tasks that have assigned_user_id
        const userIds = tasksData
          .filter(task => task.assigned_user_id)
          .map(task => task.assigned_user_id);
          
        const { data: usersData } = await supabase
          .from("app_users")
          .select("id, email, role")
          .in("id", userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);
        
        // Map the related data to each task
        const enrichedTasks = tasksData.map(task => {
          const child = childrenData?.find(child => child.id === task.child_id);
          const sponsor = sponsorsData?.find(sponsor => sponsor.id === task.sponsor_id);
          const assigned_user = usersData?.find(user => user.id === task.assigned_user_id);
          
          return {
            ...task,
            child: child || null,
            sponsor: sponsor || null,
            assigned_user: assigned_user || null
          };
        });
        
        return enrichedTasks as Task[];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
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
            {selectedTask?.id ? "Editar Tarea" : "Nueva Tarea"}
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
