
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTaskForm = (
  task: Task | null,
  onTaskSaved: () => void
) => {
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

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    relatedTo,
    setRelatedTo,
    date,
    setDate,
    onSubmit
  };
};
