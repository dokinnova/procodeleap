import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Child } from "@/types";
import { ChildStatusBadge } from "./ChildStatusBadge";
import { TableActions } from "./TableActions";
import { ChevronRight } from "lucide-react";

interface TableRowProps {
  child: Child;
  shortId: string;
  onSelect: (child: Child) => void;
  onDelete: (child: Child) => void;
}

export const TableRow = ({ child, shortId, onSelect, onDelete }: TableRowProps) => {
  return (
    <UITableRow 
      className="group hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={() => onSelect(child)}
    >
      <TableCell className="font-mono text-sm">
        {shortId}
      </TableCell>
      <TableCell className="font-medium">{child.name}</TableCell>
      <TableCell>{child.age} años</TableCell>
      <TableCell>{child.location}</TableCell>
      <TableCell>
        <ChildStatusBadge status={child.status} />
      </TableCell>
      <TableCell className="flex items-center justify-between">
        <TableActions child={child} onDelete={onDelete} />
        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </TableCell>
    </UITableRow>
  );
};