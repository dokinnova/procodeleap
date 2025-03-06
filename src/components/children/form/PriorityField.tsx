
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface PriorityFieldProps {
  priority: 'high' | 'medium' | 'low' | null;
  onInputChange: (field: string, value: 'high' | 'medium' | 'low' | null) => void;
  readOnly?: boolean;
}

export const PriorityField = ({ priority, onInputChange, readOnly = false }: PriorityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Prioridad de Apadrinamiento</Label>
      {readOnly ? (
        <div className="mt-2">
          {priority === 'high' && (
            <Badge className="bg-red-500 hover:bg-red-600">Alta</Badge>
          )}
          {priority === 'medium' && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Media</Badge>
          )}
          {priority === 'low' && (
            <Badge className="bg-green-500 hover:bg-green-600">Baja</Badge>
          )}
          {!priority && (
            <Badge variant="outline">No establecida</Badge>
          )}
        </div>
      ) : (
        <RadioGroup
          value={priority || ""}
          onValueChange={(value) => onInputChange('priority', value ? value as 'high' | 'medium' | 'low' : null)}
          className="flex flex-col space-y-1 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="flex items-center space-x-2 cursor-pointer">
              <Badge className="bg-red-500 hover:bg-red-600">Alta</Badge>
              <span>Urgente</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="flex items-center space-x-2 cursor-pointer">
              <Badge className="bg-yellow-500 hover:bg-yellow-600">Media</Badge>
              <span>Preferente</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="flex items-center space-x-2 cursor-pointer">
              <Badge className="bg-green-500 hover:bg-green-600">Baja</Badge>
              <span>Normal</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="none" />
            <Label htmlFor="none" className="flex items-center space-x-2 cursor-pointer">
              <Badge variant="outline">No establecida</Badge>
            </Label>
          </div>
        </RadioGroup>
      )}
    </div>
  );
};
