
import { Task } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskBasicFieldsProps {
  register: UseFormRegister<Task>;
  errors: any;
  defaultStatus: string;
  onStatusChange: (value: 'pending' | 'in-progress' | 'completed') => void;
}

export const TaskBasicFields = ({
  register,
  errors,
  defaultStatus,
  onStatusChange
}: TaskBasicFieldsProps) => {
  return (
    <>
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
          defaultValue={defaultStatus || "pending"}
          onValueChange={onStatusChange}
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
    </>
  );
};
