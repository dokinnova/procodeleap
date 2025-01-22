import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/types";

interface StatusAndSchoolFieldsProps {
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
  schoolId: string;
  schools: School[];
  onInputChange: (field: string, value: any) => void;
}

export const StatusAndSchoolFields = ({ 
  status, 
  schoolId, 
  schools, 
  onInputChange 
}: StatusAndSchoolFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select 
          value={status} 
          onValueChange={(value: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja') => 
            onInputChange('status', value)
          }
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="assignable">Asignable</SelectItem>
            <SelectItem value="assigned">Asignado</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">Colegio</Label>
        <Select 
          value={schoolId} 
          onValueChange={(value) => onInputChange('school_id', value)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Selecciona un colegio" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};