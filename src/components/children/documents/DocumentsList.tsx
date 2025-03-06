
import { ChildDocument } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/formatters";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { DocumentsTable } from "./DocumentsTable";
import { DocumentsListLoading, DocumentsListError, EmptyDocumentsList } from "./DocumentsListStates";

interface DocumentsListProps {
  documents: ChildDocument[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (document: ChildDocument) => void;
  isDeleting: boolean;
}

export const DocumentsList = ({ 
  documents, 
  isLoading, 
  isError,
  onDelete,
  isDeleting
}: DocumentsListProps) => {
  const [documentToDelete, setDocumentToDelete] = useState<ChildDocument | null>(null);

  if (isLoading) {
    return <DocumentsListLoading />;
  }

  if (isError) {
    return <DocumentsListError />;
  }

  if (documents.length === 0) {
    return <EmptyDocumentsList />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documentos ({documents.length})</h3>
        <Badge variant="outline">
          {formatFileSize(documents.reduce((sum, doc) => sum + doc.file_size, 0))}
        </Badge>
      </div>
      
      <DocumentsTable 
        documents={documents}
        onDeleteClick={setDocumentToDelete}
        isDeleting={isDeleting}
        deletingId={documentToDelete?.id || null}
      />

      <DeleteConfirmationDialog 
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) {
            onDelete(documentToDelete);
            setDocumentToDelete(null);
          }
        }}
        title="¿Está seguro de eliminar este documento?"
        description="Esta acción no se puede deshacer. El documento será eliminado permanentemente."
      />
    </div>
  );
};
