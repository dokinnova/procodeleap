
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Child } from "@/types";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateChildrenReportPdf } from "@/utils/pdf-generation/childrenReportPdf";

interface ChildrenReportHeaderProps {
  children: Child[];
}

export const ChildrenReportHeader = ({ children }: ChildrenReportHeaderProps) => {
  const { toast } = useToast();

  const handleGeneratePdf = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const success = generateChildrenReportPdf(children);
    
    if (success) {
      toast({
        title: "PDF generado correctamente",
        description: "El documento se ha descargado",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reporte de Niños</CardTitle>
          <CardDescription>
            Listado completo de niños registrados en el sistema
          </CardDescription>
        </div>
        <Button onClick={handleGeneratePdf} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
      </CardHeader>
    </Card>
  );
};
