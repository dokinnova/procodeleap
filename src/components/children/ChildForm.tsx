import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Child } from "@/types";
import { useChildForm } from "@/hooks/useChildForm";
import { ChildFormFields } from "./form/ChildFormFields";
import { useState } from "react";
import { useSchoolsQuery } from "@/hooks/child-form/useSchoolsQuery";
import { ChildFormError } from "./form/ChildFormError";
import { ChildFormLoading } from "./form/ChildFormLoading";

interface ChildFormProps {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
}

export const ChildForm = ({ selectedChild, setSelectedChild }: ChildFormProps) => {
  const { formData, handleInputChange, handleSubmit } = useChildForm(selectedChild, setSelectedChild);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: schools = [], isError, isLoading, refetch } = useSchoolsQuery();

  const handleFormSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <ChildFormLoading />;
  if (isError) return <ChildFormError onRetry={refetch} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedChild ? 'Editar Niño' : 'Registrar Nuevo Niño'}
        </CardTitle>
        <CardDescription>
          {selectedChild 
            ? 'Modifica los datos del niño seleccionado' 
            : 'Ingresa los datos para registrar un nuevo niño'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <ChildFormFields
            formData={formData}
            schools={schools}
            onInputChange={handleInputChange}
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
      </CardContent>
    </Card>
  );
};