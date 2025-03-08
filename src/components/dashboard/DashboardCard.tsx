
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  variant: "primary" | "secondary" | "accent";
}

export const DashboardCard = ({
  to,
  icon: Icon,
  title,
  description,
  variant,
}: DashboardCardProps) => {
  // Better background styles with brighter color palette
  const getBackgroundColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-violet-100";
      case "secondary":
        return "bg-sky-100";
      case "accent":
        return "bg-amber-100";
      default:
        return "bg-violet-100";
    }
  };

  const getIconColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "text-violet-600";
      case "secondary":
        return "text-sky-600";
      case "accent":
        return "text-amber-600";
      default:
        return "text-violet-600";
    }
  };

  return (
    <RouterLink to={to} className="w-full">
      <div className="h-full">
        <Button
          variant="outline"
          className="w-full h-full p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col items-center gap-3"
        >
          <div className={`p-3 ${getBackgroundColor(variant)} rounded-full`}>
            <Icon className={`w-5 h-5 ${getIconColor(variant)}`} />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          </div>
        </Button>
      </div>
    </RouterLink>
  );
};
