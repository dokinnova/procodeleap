
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChildDocument } from "@/types";
import { Eye, Download, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentActionsProps {
  document: ChildDocument;
  onDelete: (document: ChildDocument) => void;
  isDeleting: boolean;
  deletingId: string | null;
}

export const DocumentActions = ({ 
  document, 
  onDelete, 
  isDeleting,
  deletingId 
}: DocumentActionsProps) => {
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
  
  const isDownloading = downloadingId === document.id;
  const isCurrentlyDeleting = isDeleting && deletingId === document.id;

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleView(document)}
        disabled={isDownloading}
      >
        {isDownloading ? (
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
        disabled={isDownloading}
      >
        {isDownloading ? (
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
        onClick={() => onDelete(document)}
        disabled={isDeleting}
      >
        {isCurrentlyDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  );
};
