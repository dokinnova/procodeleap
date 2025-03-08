
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildEntity {
  id: string;
  name: string;
}

interface SponsorEntity {
  id: string;
  first_name: string;
  last_name: string;
}

interface RelatedEntitySelectorProps {
  relatedTo: 'child' | 'sponsor' | '';
  onRelatedToChange: (value: 'child' | 'sponsor' | '') => void;
  childId: string | null;
  onChildSelect: (value: string) => void;
  sponsorId: string | null;
  onSponsorSelect: (value: string) => void;
}

export const RelatedEntitySelector = ({
  relatedTo,
  onRelatedToChange,
  childId,
  onChildSelect,
  sponsorId,
  onSponsorSelect
}: RelatedEntitySelectorProps) => {
  // Fetch children for the dropdown
  const { data: children = [] } = useQuery({
    queryKey: ["children-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data as ChildEntity[];
    },
    enabled: relatedTo === "child",
  });

  // Fetch sponsors for the dropdown
  const { data: sponsors = [] } = useQuery({
    queryKey: ["sponsors-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, first_name, last_name")
        .order("last_name");
      
      if (error) throw error;
      return data as SponsorEntity[];
    },
    enabled: relatedTo === "sponsor",
  });

  return (
    <>
      <div className="space-y-2">
        <Label>Relacionada con</Label>
        <Select
          value={relatedTo}
          onValueChange={(value: 'child' | 'sponsor' | 'none') => onRelatedToChange(value === "none" ? "" : value as 'child' | 'sponsor')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar relación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="child">Niño</SelectItem>
            <SelectItem value="sponsor">Padrino</SelectItem>
            <SelectItem value="none">Sin relación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {relatedTo === "child" && (
        <div className="space-y-2">
          <Label htmlFor="child_id">Niño</Label>
          <Select
            value={childId || ""}
            onValueChange={onChildSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar niño" />
            </SelectTrigger>
            <SelectContent>
              {children && children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {relatedTo === "sponsor" && (
        <div className="space-y-2">
          <Label htmlFor="sponsor_id">Padrino</Label>
          <Select
            value={sponsorId || ""}
            onValueChange={onSponsorSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar padrino" />
            </SelectTrigger>
            <SelectContent>
              {sponsors && sponsors.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.first_name} {sponsor.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};
