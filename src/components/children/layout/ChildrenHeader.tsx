
import { Baby, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import generatePdf from "react-to-pdf";

export const ChildrenHeader = () => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impresión",
      description: "Se abrirá el diálogo de impresión automáticamente.",
    });
  };

  const handleGeneratePdf = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const options = {
      filename: `listado-ninos-${new Date().toISOString().split('T')[0]}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
      overrides: {
        pdf: {
          compress: true
        },
        canvas: {
          useCORS: true
        }
      }
    };

    try {
      // Mostrar temporalmente el elemento de impresión
      const printableElement = document.querySelector('.print\\:block');
      if (printableElement) {
        printableElement.classList.remove('hidden');
        printableElement.classList.add('block');
        
        await generatePdf(() => printableElement as HTMLElement, options);
        
        // Restaurar el estado anterior
        printableElement.classList.add('hidden');
        printableElement.classList.remove('block');
        
        toast({
          title: "PDF generado correctamente",
          description: "El documento se ha descargado",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between print:hidden">
      <div className="flex items-center gap-3">
        <Baby className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Niños Registrados</h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleGeneratePdf} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Listado
        </Button>
      </div>
    </div>
  );
};
