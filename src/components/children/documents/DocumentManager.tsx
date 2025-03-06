
import { useState } from "react";
import { useChildDocuments } from "@/hooks/useChildDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentsList } from "./DocumentsList";
import { ChildDocument } from "@/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthSession } from "@/hooks/useAuthSession";

interface DocumentManagerProps {
  childId: string;
  childName: string;
}

export const DocumentManager = ({ childId, childName }: DocumentManagerProps) => {
  const { session } = useAuthSession();
  const { 
    documents, 
    isLoading, 
    isError, 
    uploadDocument, 
    isUploading, 
    deleteDocument,
    isDeleting
  } = useChildDocuments(childId);
  
  const [selectedDoc, setSelectedDoc] = useState<ChildDocument | null>(null);

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
              Debe iniciar sesión para administrar documentos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleUpload = (file: File, description: string) => {
    uploadDocument({ file, description, childId });
  };

  const handleDelete = (document: ChildDocument) => {
    deleteDocument(document);
  };

  return (
    <Card className="mt-6">
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
