
import { Badge } from "@/components/ui/badge";
import { Clock, UserCheck, UserX } from "lucide-react";

interface UserStatusBadgeProps {
  isPending: boolean;
  isRegisteredButNotLoggedIn?: boolean;
}

export const UserStatusBadge = ({ 
  isPending, 
  isRegisteredButNotLoggedIn = false 
}: UserStatusBadgeProps) => {
  if (isPending) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pendiente
      </Badge>
    );
  }
  
  if (isRegisteredButNotLoggedIn) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
        <UserX className="h-3 w-3" />
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
