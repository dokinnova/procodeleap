import { Sponsor } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SponsorSelectProps {
  availableSponsors: Sponsor[];
  selectedSponsor: Sponsor | null;
  onSponsorSelect: (sponsorId: string) => void;
}

export const SponsorSelect = ({
  availableSponsors,
  selectedSponsor,
  onSponsorSelect,
}: SponsorSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Padrino *</Label>
      <Select
        value={selectedSponsor?.id}
        onValueChange={onSponsorSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un padrino" />
        </SelectTrigger>
        <SelectContent>
          {availableSponsors.map((sponsor) => (
            <SelectItem key={sponsor.id} value={sponsor.id}>
              {sponsor.name} - ${sponsor.contribution}/mes
            </SelectItem>
          ))}
          {availableSponsors.length === 0 && (
            <SelectItem value="none" disabled>
              No hay padrinos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};