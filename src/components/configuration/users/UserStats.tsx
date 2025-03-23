
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AppUser } from "../utils/user-sync";

interface UserStatsProps {
  users: AppUser[] | undefined;
  pendingUsers: AppUser[];
  isSyncing: boolean;
  onSyncClick: () => void;
}

export const UserStats = ({ users, pendingUsers, isSyncing, onSyncClick }: UserStatsProps) => {
  if (!users) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
      <div>
        <p className="text-blue-800 font-medium">
          Total de usuarios registrados: <span className="font-bold">{users.length}</span>
        </p>
        {pendingUsers.length > 0 && (
          <p className="text-amber-600 text-sm">
            Usuarios pendientes de confirmación: <span className="font-bold">{pendingUsers.length}</span>
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSyncClick}
        disabled={isSyncing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        Sincronizar
      </Button>
    </div>
  );
};
