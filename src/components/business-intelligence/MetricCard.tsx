
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  gradient
}: MetricCardProps) => {
  return (
    <Card className={`bg-gradient-to-br ${gradient} shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
