
import { Badge } from "@/components/ui/badge";
import { Clock, UserCheck } from "lucide-react";

interface UserStatusBadgeProps {
  isPending: boolean;
}

export const UserStatusBadge = ({ isPending }: UserStatusBadgeProps) => {
  if (isPending) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pendiente
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
      <UserCheck className="h-3 w-3" />
      Confirmado
    </Badge>
  );
};
