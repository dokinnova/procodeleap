import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChildFormFields } from "./form/ChildFormFields";
import { Child } from "@/types";
import { useChildForm, ChildFormData } from "@/hooks/useChildForm";

interface ChildFormProps {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
}

export const ChildForm = ({ selectedChild, setSelectedChild }: ChildFormProps) => {
  const { formData, handleInputChange, handleSubmit } = useChildForm(selectedChild, setSelectedChild);

  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <ChildFormFields
            formData={formData}
            schools={schools}
            onInputChange={handleInputChange}
          />

          <div className="flex justify-end gap-2">
            {selectedChild && (
              <Button variant="outline" onClick={() => setSelectedChild(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {selectedChild ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};