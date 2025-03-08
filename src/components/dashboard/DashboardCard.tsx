
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
  // Mejoramos los estilos de los fondos para crear un aspecto más profesional
  const getBackgroundColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-primary/5";
      case "secondary":
        return "bg-secondary/40";
      case "accent":
        return "bg-accent/30";
      default:
        return "bg-primary/5";
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
            <Icon className="w-5 h-5 text-primary" />
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
