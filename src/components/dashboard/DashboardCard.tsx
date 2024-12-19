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
  const getBackgroundColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-primary/10";
      case "secondary":
        return "bg-secondary/10";
      case "accent":
        return "bg-accent/10";
      default:
        return "bg-primary/10";
    }
  };

  const getIconColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary-foreground";
      case "accent":
        return "text-accent-foreground";
      default:
        return "text-primary";
    }
  };

  return (
    <RouterLink to={to} className="w-full">
      <Button
        variant="outline"
        className="w-full h-auto p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 ${getBackgroundColor(variant)} rounded-full flex items-center justify-center w-12 h-12`}>
            <Icon className={`w-6 h-6 ${getIconColor(variant)} stroke-[1.5]`} />
          </div>
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        </div>
      </Button>
    </RouterLink>
  );
};