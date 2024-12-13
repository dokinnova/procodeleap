import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

interface Sponsorship {
  id: string;
  sponsor?: {
    name: string;
    contribution: number;
  };
  child?: {
    name: string;
  };
}

interface SponsorshipsListProps {
  sponsorships: Sponsorship[];
  onGenerateReceipt: (sponsorship: Sponsorship) => void;
  isGenerating: boolean;
}

export const SponsorshipsList = ({
  sponsorships,
  onGenerateReceipt,
  isGenerating,
}: SponsorshipsListProps) => {
  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Generar recibos de padrinos activos</h3>
      {sponsorships.map((sponsorship) => (
        <Card key={sponsorship.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Apadrinamiento: {sponsorship.sponsor?.name} - {sponsorship.child?.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateReceipt(sponsorship)}
              disabled={isGenerating}
              className="gap-2"
            >
              <Receipt className="w-4 h-4" />
              Generar Recibo
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monto mensual: ${sponsorship.sponsor?.contribution}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};