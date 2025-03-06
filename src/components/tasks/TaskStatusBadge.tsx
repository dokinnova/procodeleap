
import { Badge } from "@/components/ui/badge";

interface TaskStatusBadgeProps {
  status: string;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Completada
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Pendiente
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          En Progreso
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          {status}
        </Badge>
      );
  }
};
