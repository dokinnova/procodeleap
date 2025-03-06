
import { Separator } from "@/components/ui/separator";

export const SponsorshipDivider = () => {
  return (
    <div className="relative py-8">
      <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
      <div className="relative z-10 flex justify-center">
        <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
          Apadrinamientos Activos
        </span>
      </div>
    </div>
  );
};
