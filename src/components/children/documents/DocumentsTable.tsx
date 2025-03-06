
import { ChildDocument } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFileSize } from "@/lib/formatters";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { FileTypeIcon } from "./FileTypeIcon";
import { DocumentActions } from "./DocumentActions";
import { Badge } from "@/components/ui/badge";

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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Descripción</TableHead>
            <TableHead className="font-semibold">Tamaño</TableHead>
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="text-right font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 p-1.5 rounded">
                    <FileTypeIcon fileType={document.file_type} />
                  </div>
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
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {formatFileSize(document.file_size)}
                </Badge>
              </TableCell>
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
