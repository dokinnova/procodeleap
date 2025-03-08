
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

  // Obtener días que tienen tareas
  const daysWithTasks = tasks
    .filter(task => task.due_date)
    .map(task => new Date(task.due_date as string));

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
              hasTasks: daysWithTasks,
            }}
            modifiersStyles={{
              hasTasks: {
                backgroundColor: "#D3E4FD",
                fontWeight: "bold",
                borderRadius: "0.2rem",
              },
            }}
          />
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
