
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
    onSubmit,
    childId,
    sponsorId
  } = useTaskForm(task, onTaskSaved);

  console.log("TaskForm - childId:", childId);
  console.log("TaskForm - task?.child_id:", task?.child_id);

  const handleChildSelect = (value: string) => {
    if (value === "select-child") return;
    console.log("Setting child_id to:", value);
    setValue("child_id", value);
  };

  const handleSponsorSelect = (value: string) => {
    if (value === "select-sponsor") return;
    console.log("Setting sponsor_id to:", value);
    setValue("sponsor_id", value);
  };

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
            childId={childId || task?.child_id || null}
            onChildSelect={handleChildSelect}
            sponsorId={sponsorId || task?.sponsor_id || null}
            onSponsorSelect={handleSponsorSelect}
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
