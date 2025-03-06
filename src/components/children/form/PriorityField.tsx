
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Flame, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityFieldProps {
  priority: 'high' | 'medium' | 'low' | null;
  onInputChange: (field: string, value: 'high' | 'medium' | 'low' | null) => void;
  readOnly?: boolean;
}

export const PriorityField = ({ priority, onInputChange, readOnly = false }: PriorityFieldProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Prioridad de Apadrinamiento</Label>
      
      {readOnly ? (
        <div className="mt-2">
          {priority === 'high' && (
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200">
              <Flame className="h-3.5 w-3.5 mr-1" />
              Alta
            </Badge>
          )}
          {priority === 'medium' && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200">
              <Info className="h-3.5 w-3.5 mr-1" />
              Media
            </Badge>
          )}
          {priority === 'low' && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Baja
            </Badge>
          )}
          {!priority && (
            <Badge variant="outline" className="text-gray-500">
              No establecida
            </Badge>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 mt-3">
          <PriorityOption
            value="high"
            label="Alta"
            description="Urgente - Necesita apadrinamiento inmediato"
            icon={<Flame className="h-4 w-4" />}
            selected={priority === 'high'}
            onClick={() => onInputChange('priority', 'high')}
            bgClass="bg-rose-50 border-rose-200 hover:bg-rose-100"
            iconClass="text-rose-600"
          />
          
          <PriorityOption
            value="medium"
            label="Media"
            description="Preferente - Necesita apadrinamiento pronto"
            icon={<Info className="h-4 w-4" />}
            selected={priority === 'medium'}
            onClick={() => onInputChange('priority', 'medium')}
            bgClass="bg-amber-50 border-amber-200 hover:bg-amber-100"
            iconClass="text-amber-600"
          />
          
          <PriorityOption
            value="low"
            label="Baja"
            description="Normal - Puede esperar para ser apadrinado"
            icon={<CheckCircle2 className="h-4 w-4" />}
            selected={priority === 'low'}
            onClick={() => onInputChange('priority', 'low')}
            bgClass="bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            iconClass="text-emerald-600"
          />
          
          <PriorityOption
            value=""
            label="No establecida"
            description="Sin prioridad definida"
            selected={priority === null}
            onClick={() => onInputChange('priority', null)}
            bgClass="bg-gray-50 border-gray-200 hover:bg-gray-100"
            iconClass="text-gray-500"
          />
        </div>
      )}
    </div>
  );
};

interface PriorityOptionProps {
  value: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  bgClass: string;
  iconClass: string;
}

const PriorityOption = ({
  value,
  label,
  description,
  icon,
  selected,
  onClick,
  bgClass,
  iconClass
}: PriorityOptionProps) => (
  <div
    className={cn(
      "relative flex items-center p-3 rounded-md border cursor-pointer transition-all duration-200",
      bgClass,
      selected ? "ring-2 ring-primary ring-offset-1" : ""
    )}
    onClick={onClick}
  >
    <div className={cn("flex-shrink-0 mr-4 flex items-center justify-center", iconClass)}>
      {icon}
    </div>
    <div className="flex-grow">
      <div className="font-medium">{label}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </div>
    <div className="flex-shrink-0 h-4 w-4 rounded-full border border-primary ml-3">
      {selected && <div className="h-2 w-2 rounded-full bg-primary m-0.5"></div>}
    </div>
  </div>
);
