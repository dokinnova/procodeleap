import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Child } from "@/types";

interface TableActionsProps {
  child: Child;
  onDelete: (child: Child) => void;
}

export const TableActions = ({ child, onDelete }: TableActionsProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(child);
      }}
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};