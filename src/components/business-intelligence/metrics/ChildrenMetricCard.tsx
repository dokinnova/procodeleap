
import { Users } from "lucide-react";
import { MetricCard } from "../MetricCard";

interface ChildrenMetricCardProps {
  totalChildren: number;
  assignedChildren: number;
}

export const ChildrenMetricCard = ({ totalChildren, assignedChildren }: ChildrenMetricCardProps) => {
  const porcentajeAsignados = totalChildren > 0 
    ? Math.round((assignedChildren / totalChildren) * 100) 
    : 0;

  return (
    <MetricCard
      title="Niños Registrados"
      value={totalChildren}
      subtitle={`${assignedChildren} apadrinados (${porcentajeAsignados}%)`}
      icon={Users}
      iconColor="text-blue-500"
      gradient="from-blue-50 to-indigo-50"
    />
  );
};
