
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Child } from "@/types";
import { useChildForm } from "@/hooks/useChildForm";
import { ChildFormFields } from "./form/ChildFormFields";
import { useState, useEffect } from "react";
import { useSchoolsQuery } from "@/hooks/child-form/useSchoolsQuery";
import { ChildFormError } from "./form/ChildFormError";
import { ChildFormLoading } from "./form/ChildFormLoading";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChildFormProps {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
}

export const ChildForm = ({ selectedChild, setSelectedChild }: ChildFormProps) => {
  const { formData, handleInputChange, handleSubmit } = useChildForm(selectedChild, setSelectedChild);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: schools = [], isError, isLoading, refetch } = useSchoolsQuery();
  const { checkPermission, canCreate, canEdit, role } = useUserPermissions();

  // Add effect to log selectedChild changes
  useEffect(() => {
    if (selectedChild) {
      console.log('ChildForm received selectedChild:', selectedChild);
    }
  }, [selectedChild]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has permission before proceeding
    if (!checkPermission(selectedChild ? 'edit' : 'create')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <ChildFormLoading />;
  if (isError) return <ChildFormError onRetry={refetch} />;

  // All users can view data, but only users with correct permissions can edit/create
  const hasEditPermission = selectedChild ? canEdit : canCreate;
  const isReadOnly = selectedChild && !canEdit;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedChild ? (hasEditPermission ? 'Editar Niño' : 'Detalles del Niño') : 'Registrar Nuevo Niño'}
        </CardTitle>
        <CardDescription>
          {selectedChild 
            ? (hasEditPermission ? 'Modifica los datos del niño seleccionado' : 'Visualiza los datos del niño seleccionado')
            : 'Ingresa los datos para registrar un nuevo niño'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedChild && !canCreate ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              No tienes permisos para crear registros.
              Contacta al administrador para solicitar acceso.
            </AlertDescription>
          </Alert>
        ) : isReadOnly ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Modo de Visualización</AlertTitle>
              <AlertDescription>
                Tienes permisos de visualización. No puedes editar la información.
              </AlertDescription>
            </Alert>
            <form className="space-y-4">
              <ChildFormFields
                formData={formData}
                schools={schools}
                onInputChange={() => {}}
                readOnly={true}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedChild(null)}
                >
                  Volver
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <ChildFormFields
              formData={formData}
              schools={schools}
              onInputChange={handleInputChange}
              readOnly={false}
            />

            <div className="flex justify-end gap-2">
              {selectedChild && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedChild(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Guardando...' 
                  : selectedChild 
                    ? 'Actualizar' 
                    : 'Registrar'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
