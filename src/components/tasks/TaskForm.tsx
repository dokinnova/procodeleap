
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TaskFormProps {
  task: Task | null;
  onTaskSaved: () => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onTaskSaved, onCancel }: TaskFormProps) => {
  const { toast } = useToast();
  const [relatedTo, setRelatedTo] = useState<'child' | 'sponsor' | ''>( 
    task?.related_to || ''
  );
  const [date, setDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Task>({
    defaultValues: task || {
      title: "",
      description: "",
      status: "pending",
      related_to: null,
      child_id: null,
      sponsor_id: null,
      due_date: null,
    },
  });

  // Fetch children for the dropdown
  const { data: children } = useQuery({
    queryKey: ["children-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: relatedTo === "child",
  });

  // Fetch sponsors for the dropdown
  const { data: sponsors } = useQuery({
    queryKey: ["sponsors-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, first_name, last_name")
        .order("last_name");
      
      if (error) throw error;
      return data;
    },
    enabled: relatedTo === "sponsor",
  });

  useEffect(() => {
    if (task) {
      reset(task);
      setRelatedTo(task.related_to || '');
      setDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task, reset]);

  const onSubmit = async (data: Task) => {
    try {
      const formData = {
        ...data,
        due_date: date?.toISOString() || null,
        related_to: relatedTo || null,
        child_id: relatedTo === "child" ? data.child_id : null,
        sponsor_id: relatedTo === "sponsor" ? data.sponsor_id : null,
      };

      if (task?.id) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update(formData)
          .eq("id", task.id);
        
        if (error) throw error;
        
        toast({
          title: "Tarea actualizada",
          description: "La tarea ha sido actualizada exitosamente.",
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from("tasks")
          .insert(formData);
        
        if (error) throw error;
        
        toast({
          title: "Tarea creada",
          description: "La tarea ha sido creada exitosamente.",
        });
      }
      
      onTaskSaved();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task?.id ? "Editar Tarea" : "Nueva Tarea"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register("title", { required: "El título es requerido" })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              defaultValue={task?.status || "pending"}
              onValueChange={(value: 'pending' | 'in-progress' | 'completed') => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha de vencimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Relacionada con</Label>
            <Select
              value={relatedTo}
              onValueChange={(value: 'child' | 'sponsor' | '') => setRelatedTo(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar relación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin relación</SelectItem>
                <SelectItem value="child">Niño</SelectItem>
                <SelectItem value="sponsor">Padrino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {relatedTo === "child" && (
            <div className="space-y-2">
              <Label htmlFor="child_id">Niño</Label>
              <Select
                defaultValue={task?.child_id || ""}
                onValueChange={(value) => setValue("child_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar niño" />
                </SelectTrigger>
                <SelectContent>
                  {children?.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {relatedTo === "sponsor" && (
            <div className="space-y-2">
              <Label htmlFor="sponsor_id">Padrino</Label>
              <Select
                defaultValue={task?.sponsor_id || ""}
                onValueChange={(value) => setValue("sponsor_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar padrino" />
                </SelectTrigger>
                <SelectContent>
                  {sponsors?.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={sponsor.id}>
                      {sponsor.first_name} {sponsor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {task?.id ? "Actualizar" : "Crear"} Tarea
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
