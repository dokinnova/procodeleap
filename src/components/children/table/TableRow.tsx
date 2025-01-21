import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Child } from "@/types";
import { ChildStatusBadge } from "./ChildStatusBadge";
import { TableActions } from "./TableActions";

interface TableRowProps {
  child: Child;
  shortId: string;
  onSelect: (child: Child) => void;
  onDelete: (child: Child) => void;
}

export const TableRow = ({ child, shortId, onSelect, onDelete }: TableRowProps) => {
  return (
    <UITableRow 
      className="hover:bg-gray-50 cursor-pointer"
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
      <TableCell>
        <TableActions child={child} onDelete={onDelete} />
      </TableCell>
    </UITableRow>
  );
};