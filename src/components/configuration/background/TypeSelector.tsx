
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TypeSelectorProps {
  value: "color" | "image";
  onChange: (value: "color" | "image") => void;
}

export const TypeSelector = ({ value, onChange }: TypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Tipo de Fondo</h3>
      <RadioGroup 
        value={value} 
        onValueChange={(v) => onChange(v as "color" | "image")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="color" id="color" />
          <Label htmlFor="color">Color Sólido</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="image" id="image" />
          <Label htmlFor="image">Imagen</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
