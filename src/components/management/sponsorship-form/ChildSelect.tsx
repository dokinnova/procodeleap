import { Child } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChildSelectProps {
  availableChildren: Child[];
  selectedChild: Child | null;
  onChildSelect: (childId: string) => void;
}

export const ChildSelect = ({
  availableChildren,
  selectedChild,
  onChildSelect,
}: ChildSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Niño *</Label>
      <Select
        value={selectedChild?.id}
        onValueChange={onChildSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un niño" />
        </SelectTrigger>
        <SelectContent>
          {availableChildren.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              {child.name} - {child.age} años
            </SelectItem>
          ))}
          {availableChildren.length === 0 && (
            <SelectItem value="none" disabled>
              No hay niños disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};