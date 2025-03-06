
import { useState, useEffect } from "react";
import { useChildDocuments } from "@/hooks/useChildDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentsList } from "./DocumentsList";
import { ChildDocument } from "@/types";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";

interface DocumentManagerProps {
  childId: string;
  childName: string;
}

export const DocumentManager = ({ childId, childName }: DocumentManagerProps) => {
  const { session, loading } = useAuthSession();
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<ChildDocument | null>(null);
  
  // Mostrar logs para debug
  useEffect(() => {
    console.log("DocumentManager montado con childId:", childId);
    console.log("Session:", session);
    console.log("Loading:", loading);
  }, [childId, session, loading]);
  
  const { 
    documents, 
    isLoading, 
    isError, 
    error,
    uploadDocument, 
    isUploading, 
    deleteDocument,
    isDeleting
  } = useChildDocuments(childId);

  useEffect(() => {
    if (isError && error) {
      console.error("Error al cargar documentos:", error);
      toast({
        title: "Error al cargar documentos",
        description: "No se pudieron cargar los documentos del niño",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Cargando información de sesión...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Administre los documentos del niño</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>
              Debe iniciar sesión para administrar documentos. Si ya ha iniciado sesión, por favor, actualice la página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleUpload = (file: File, description: string) => {
    console.log("Subiendo documento:", file.name);
    uploadDocument({ file, description, childId });
  };

  const handleDelete = (document: ChildDocument) => {
    console.log("Eliminando documento:", document.filename);
    deleteDocument(document);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos de {childName}</CardTitle>
        <CardDescription>
          Suba y administre documentos como certificados, identificaciones y registros escolares
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DocumentUploader 
          onUpload={handleUpload} 
          isUploading={isUploading}
        />
        
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ocurrió un error al cargar los documentos. Por favor, inténtelo de nuevo.
            </AlertDescription>
          </Alert>
        )}
        
        <DocumentsList 
          documents={documents} 
          isLoading={isLoading} 
          isError={isError}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </CardContent>
    </Card>
  );
};
