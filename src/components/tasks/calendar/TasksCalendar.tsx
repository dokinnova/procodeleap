
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

interface TasksCalendarProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

export const TasksCalendar = ({ tasks, onTaskSelect }: TasksCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Función para obtener tareas por fecha
  const getTasksByDate = (date: Date | undefined) => {
    if (!date || !tasks.length) return [];
    
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Obtener días con tareas y su estado dominante
  const getDaysWithTasksAndStatus = () => {
    // Crear un mapa para agrupar tareas por fecha
    const tasksByDate = new Map<string, Task[]>();
    
    tasks.filter(task => task.due_date).forEach(task => {
      const date = new Date(task.due_date as string);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!tasksByDate.has(dateKey)) {
        tasksByDate.set(dateKey, []);
      }
      tasksByDate.get(dateKey)?.push(task);
    });
    
    // Determinar el estado dominante para cada fecha
    const daysWithStatus = new Map<string, string>();
    
    tasksByDate.forEach((dayTasks, dateKey) => {
      // Contar estados
      const statusCounts: Record<string, number> = {};
      dayTasks.forEach(task => {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      });
      
      // Encontrar el estado más común
      let dominantStatus = "pending";
      let maxCount = 0;
      
      // Prioridad: completed > in-progress > pending
      if (statusCounts["completed"] && statusCounts["completed"] >= maxCount) {
        dominantStatus = "completed";
        maxCount = statusCounts["completed"];
      }
      
      if (statusCounts["in-progress"] && (statusCounts["in-progress"] > maxCount || (statusCounts["in-progress"] === maxCount && dominantStatus !== "completed"))) {
        dominantStatus = "in-progress";
        maxCount = statusCounts["in-progress"];
      }
      
      if (statusCounts["pending"] && (statusCounts["pending"] > maxCount && dominantStatus !== "completed" && dominantStatus !== "in-progress")) {
        dominantStatus = "pending";
      }
      
      daysWithStatus.set(dateKey, dominantStatus);
    });
    
    return { tasksByDate, daysWithStatus };
  };

  const { tasksByDate, daysWithStatus } = getDaysWithTasksAndStatus();

  // Convertir el mapa a un conjunto de fechas para los modificadores del calendario
  const getDatesByStatus = (status: string) => {
    const dates: Date[] = [];
    daysWithStatus.forEach((dayStatus, dateKey) => {
      if (dayStatus === status) {
        const [year, month, day] = dateKey.split('-').map(Number);
        dates.push(new Date(year, month, day));
      }
    });
    return dates;
  };

  // Obtener fechas con tareas por estado
  const completedTaskDates = getDatesByStatus("completed");
  const inProgressTaskDates = getDatesByStatus("in-progress");
  const pendingTaskDates = getDatesByStatus("pending");

  // Tareas del día seleccionado
  const tasksForSelectedDate = getTasksByDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="p-3 pointer-events-auto"
            modifiers={{
              completed: completedTaskDates,
              inProgress: inProgressTaskDates,
              pending: pendingTaskDates,
            }}
            modifiersStyles={{
              completed: {
                backgroundColor: "#ECFDF5", // Suave verde para completadas
                fontWeight: "bold",
                borderRadius: "0.2rem",
                color: "#059669",
              },
              inProgress: {
                backgroundColor: "#EFF6FF", // Suave azul para en progreso
                fontWeight: "bold",
                borderRadius: "0.2rem",
                color: "#3B82F6",
              },
              pending: {
                backgroundColor: "#FEF3C7", // Suave amarillo para pendientes
                fontWeight: "bold",
                borderRadius: "0.2rem",
                color: "#D97706",
              },
            }}
          />
          <div className="mt-4 flex flex-col space-y-2">
            <div className="text-sm font-medium">Leyenda:</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-[#ECFDF5] mr-2 border border-[#059669]"></div>
                <span className="text-xs">Completadas</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-[#EFF6FF] mr-2 border border-[#3B82F6]"></div>
                <span className="text-xs">En Progreso</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-[#FEF3C7] mr-2 border border-[#D97706]"></div>
                <span className="text-xs">Pendientes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {selectedDate
                ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
                : "Seleccione una fecha"}
            </h2>
          </div>

          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay tareas programadas para esta fecha
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForSelectedDate.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2">
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTaskSelect(task)}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
