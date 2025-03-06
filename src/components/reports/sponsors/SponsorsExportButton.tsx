
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sponsor } from "@/types";
import { generateSponsorsPdf } from "@/utils/pdf-generation/sponsorsReportPdf";

interface SponsorsExportButtonProps {
  sponsors: Sponsor[];
}

export const SponsorsExportButton = ({ sponsors }: SponsorsExportButtonProps) => {
  const { toast } = useToast();

  const handlePrintSponsors = async () => {
    await generateSponsorsPdf(sponsors, toast);
  };

  return (
    <Button onClick={handlePrintSponsors} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Generar PDF
    </Button>
  );
};
