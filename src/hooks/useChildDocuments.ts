
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChildDocument } from "@/types";
import { useToast } from "./use-toast";

export const CHILD_DOCUMENTS_QUERY_KEY = 'childDocuments';

export const useChildDocuments = (childId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('child_documents')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChildDocument[];
    } catch (error: any) {
      toast({
        title: "Error al cargar documentos",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadDocument = async ({ 
    file, 
    description, 
    childId 
  }: { 
    file: File; 
    description: string; 
    childId: string 
  }) => {
    try {
      // 1. Obtener la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No se ha encontrado una sesión de usuario");
      }
      
      // 2. Subir archivo al bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${childId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('child_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // 3. Guardar metadatos en la tabla
      const { error: dbError } = await supabase
        .from('child_documents')
        .insert({
          child_id: childId,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          description: description || null,
          uploaded_by: session.user.id
        });
      
      if (dbError) {
        // Si hay error en la BD, eliminar el archivo subido
        await supabase.storage
          .from('child_documents')
          .remove([filePath]);
        
        throw dbError;
      }
      
      // 4. Refetch para actualizar la lista
      queryClient.invalidateQueries({ queryKey: [CHILD_DOCUMENTS_QUERY_KEY, childId] });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error al subir documento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDocument = async (document: ChildDocument) => {
    try {
      // 1. Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('child_documents')
        .remove([document.file_path]);
      
      if (storageError) throw storageError;
      
      // 2. Eliminar metadatos de la tabla
      const { error: dbError } = await supabase
        .from('child_documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) throw dbError;
      
      // 3. Refetch para actualizar la lista
      queryClient.invalidateQueries({ queryKey: [CHILD_DOCUMENTS_QUERY_KEY, childId] });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error al eliminar documento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // 4. Hook para obtener documentos
  const documentsQuery = useQuery({
    queryKey: [CHILD_DOCUMENTS_QUERY_KEY, childId],
    queryFn: fetchDocuments,
    enabled: !!childId,
  });

  // 5. Mutaciones para subir y eliminar
  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha subido correctamente",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente",
      });
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
