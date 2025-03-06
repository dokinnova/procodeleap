
import { Badge } from "@/components/ui/badge";

interface ChildPriorityBadgeProps {
  priority: 'high' | 'medium' | 'low' | null;
}

export const ChildPriorityBadge = ({ priority }: ChildPriorityBadgeProps) => {
  if (!priority) {
    return null;
  }
  
  const badgeStyles = {
    high: "bg-red-500 hover:bg-red-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    low: "bg-green-500 hover:bg-green-600",
  };
  
  const priorityLabels = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };
  
  return (
    <Badge className={badgeStyles[priority]}>
      {priorityLabels[priority]}
    </Badge>
  );
};
