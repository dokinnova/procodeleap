
import { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskForm } from "./task-form/useTaskForm";
import { TaskBasicFields } from "./task-form/TaskBasicFields";
import { TaskDatePicker } from "./task-form/TaskDatePicker";
import { RelatedEntitySelector } from "./task-form/RelatedEntitySelector";
import { TaskFormActions } from "./task-form/TaskFormActions";
import { UserSelector } from "./task-form/UserSelector";

interface TaskFormProps {
  task: Task | null;
  onTaskSaved: () => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onTaskSaved, onCancel }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    errors,
    relatedTo,
    setRelatedTo,
    date,
    setDate,
    assignedUserId,
    setAssignedUserId,
    onSubmit
  } = useTaskForm(task, onTaskSaved);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task?.id ? "Editar Tarea" : "Nueva Tarea"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <TaskBasicFields
            register={register}
            errors={errors}
            defaultStatus={task?.status || "pending"}
            onStatusChange={(value) => setValue("status", value)}
          />

          <TaskDatePicker 
            date={date} 
            onDateChange={setDate} 
          />

          <UserSelector
            assignedUserId={assignedUserId}
            onUserSelect={setAssignedUserId}
          />

          <RelatedEntitySelector
            relatedTo={relatedTo}
            onRelatedToChange={setRelatedTo}
            childId={task?.child_id || null}
            onChildSelect={(value) => setValue("child_id", value)}
            sponsorId={task?.sponsor_id || null}
            onSponsorSelect={(value) => setValue("sponsor_id", value)}
          />
        </CardContent>
        <CardFooter>
          <TaskFormActions 
            isEditing={!!task?.id} 
            onCancel={onCancel} 
          />
        </CardFooter>
      </form>
    </Card>
  );
};
