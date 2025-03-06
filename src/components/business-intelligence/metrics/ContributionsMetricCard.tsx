
import { Activity } from "lucide-react";
import { MetricCard } from "../MetricCard";

interface ContributionsMetricCardProps {
  totalContributions: number;
  totalSponsorships: number;
}

export const ContributionsMetricCard = ({ totalContributions, totalSponsorships }: ContributionsMetricCardProps) => {
  return (
    <MetricCard
      title="Contribución Total"
      value={`$${totalContributions.toLocaleString()}`}
      subtitle={`${totalSponsorships} apadrinamientos activos`}
      icon={Activity}
      iconColor="text-purple-500"
      gradient="from-purple-50 to-pink-50"
    />
  );
};
