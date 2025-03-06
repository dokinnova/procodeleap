
import { ChildDocument } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFileSize } from "@/lib/formatters";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FileTypeIcon } from "./FileTypeIcon";
import { DocumentActions } from "./DocumentActions";

interface DocumentsTableProps {
  documents: ChildDocument[];
  onDeleteClick: (document: ChildDocument) => void;
  isDeleting: boolean;
  deletingId: string | null;
}

export const DocumentsTable = ({ 
  documents,
  onDeleteClick,
  isDeleting,
  deletingId
}: DocumentsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <FileTypeIcon fileType={document.file_type} />
                  <span className="max-w-[200px] truncate" title={document.filename}>
                    {document.filename}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="max-w-[200px] truncate" title={document.description || ''}>
                  {document.description || '-'}
                </span>
              </TableCell>
              <TableCell>{formatFileSize(document.file_size)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(document.created_at), { 
                  addSuffix: true,
                  locale: es
                })}
              </TableCell>
              <TableCell className="text-right">
                <DocumentActions 
                  document={document}
                  onDelete={onDeleteClick}
                  isDeleting={isDeleting}
                  deletingId={deletingId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
