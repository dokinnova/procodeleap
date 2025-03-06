
import { Child } from "@/types";
import generatePdf from "react-to-pdf";
import { useToast } from "@/hooks/use-toast";

export const usePrintPdf = () => {
  const { toast } = useToast();

  const handlePrintProfile = async (child: Child) => {
    const options = {
      filename: `ficha-${child.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
    };

    try {
      const targetElement = document.getElementById(`printable-profile-${child.id}`);
      if (targetElement) {
        await generatePdf(() => targetElement, options);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrintTable = async (title: string) => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const options = {
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
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
      const targetElement = document.getElementById(`table-printable-${title.replace(/\s+/g, '-')}`);
      if (targetElement) {
        await generatePdf(() => targetElement, options);
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

  return {
    handlePrintProfile,
    handlePrintTable
  };
};
