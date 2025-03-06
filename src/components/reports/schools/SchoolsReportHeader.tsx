
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchoolsReportHeaderProps {
  onGeneratePdf: () => void;
}

export const SchoolsReportHeader = ({ onGeneratePdf }: SchoolsReportHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Listado de Colegios</h1>
      </div>
      <Button onClick={onGeneratePdf} variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Generar PDF
      </Button>
    </div>
  );
};
