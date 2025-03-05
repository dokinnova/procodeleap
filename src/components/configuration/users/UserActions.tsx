
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AppUser } from "../utils/userSync";

interface UserActionsProps {
  user: AppUser;
  isCurrentUser: boolean;
  onEditClick: (user: AppUser) => void;
  onDeleteClick: (userId: string) => void;
  isEditingAny: boolean;
}

export const UserActions = ({ 
  user, 
  isCurrentUser, 
  onEditClick, 
  onDeleteClick,
  isEditingAny
}: UserActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEditClick(user)}
        disabled={isEditingAny}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isCurrentUser}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el usuario permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDeleteClick(user.user_id);
              setShowDeleteDialog(false);
            }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
