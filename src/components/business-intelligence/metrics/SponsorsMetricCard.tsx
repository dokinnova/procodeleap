
import { UserPlus } from "lucide-react";
import { MetricCard } from "../MetricCard";

interface SponsorsMetricCardProps {
  totalSponsors: number;
  activeSponsors: number;
}

export const SponsorsMetricCard = ({ totalSponsors, activeSponsors }: SponsorsMetricCardProps) => {
  const activePercentage = totalSponsors > 0 
    ? Math.round((activeSponsors / totalSponsors) * 100) 
    : 0;

  return (
    <MetricCard
      title="Padrinos Registrados"
      value={totalSponsors}
      subtitle={`${activeSponsors} activos (${activePercentage}%)`}
      icon={UserPlus}
      iconColor="text-green-500"
      gradient="from-green-50 to-teal-50"
    />
  );
};
