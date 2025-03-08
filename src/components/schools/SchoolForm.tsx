
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School } from "@/types";
import { useUserPermissions } from "@/hooks/useUserPermissions";

interface SchoolFormProps {
  formData: {
    name: string;
    address: string;
  };
  selectedSchool: School | null;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export const SchoolForm = ({
  formData,
  selectedSchool,
  handleInputChange,
  handleSubmit,
  handleCancel,
}: SchoolFormProps) => {
  const { checkPermission } = useUserPermissions();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has permission before proceeding
    if (!checkPermission(selectedSchool ? 'edit' : 'create')) {
      return;
    }

    await handleSubmit(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedSchool ? 'Editar Colegio' : 'Registrar Nuevo Colegio'}
        </CardTitle>
        <CardDescription>
          {selectedSchool 
            ? 'Modifica los datos del colegio seleccionado' 
            : 'Ingresa los datos para registrar un nuevo colegio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del colegio</Label>
            <Input
              id="name"
              placeholder="Nombre del colegio"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Dirección del colegio"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            {selectedSchool && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {selectedSchool ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
