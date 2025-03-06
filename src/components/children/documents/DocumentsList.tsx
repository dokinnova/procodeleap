
import { ChildDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon, Trash2, Download, Eye, Loader2 } from "lucide-react";
import { formatFileSize } from "@/lib/formatters";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (childDocument: ChildDocument) => {
    try {
      setDownloadingId(childDocument.id);
      
      const { data, error } = await supabase.storage
        .from('child_documents')
        .download(childDocument.file_path);
      
      if (error) throw error;
      
      // Crear URL del blob y descargar
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = childDocument.filename;
      window.document.body.appendChild(a);
      a.click();
      
      // Limpiar
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileIcon className="h-4 w-4 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileIcon className="h-4 w-4 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileIcon className="h-4 w-4 text-indigo-500" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileIcon className="h-4 w-4 text-green-500" />;
    } else {
      return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Función para visualizar documentos (abre en nueva pestaña)
  const handleView = async (childDocument: ChildDocument) => {
    try {
      setDownloadingId(childDocument.id);
      
      const { data, error } = await supabase.storage
        .from('child_documents')
        .createSignedUrl(childDocument.file_path, 60);
      
      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error al visualizar:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Documentos</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error al cargar documentos
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>No se pudieron cargar los documentos. Intente nuevamente.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="mt-4 rounded-md bg-gray-50 p-8 text-center">
        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Sin documentos
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay documentos asociados a este niño. Suba documentos usando el formulario de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documentos ({documents.length})</h3>
        <Badge variant="outline">{formatFileSize(documents.reduce((sum, doc) => sum + doc.file_size, 0))}</Badge>
      </div>
      
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
                    {getFileIcon(document.file_type)}
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
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(document)}
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(document)}
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="sr-only">Descargar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setDocumentToDelete(document)}
                      disabled={isDeleting}
                    >
                      {isDeleting && documentToDelete?.id === document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog 
        open={!!documentToDelete} 
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (documentToDelete) {
                  onDelete(documentToDelete);
                  setDocumentToDelete(null);
                }
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
