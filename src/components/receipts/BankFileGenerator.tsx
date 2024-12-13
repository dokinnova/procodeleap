import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Receipt {
  id: string;
  amount: number;
  sponsorship: {
    sponsor: {
      name: string;
      email: string;
    };
    child: {
      name: string;
    };
  };
}

interface BankFileGeneratorProps {
  receipts: Receipt[];
}

export const BankFileGenerator = ({ receipts }: BankFileGeneratorProps) => {
  const { toast } = useToast();

  const generateBankFile = () => {
    if (receipts.length === 0) {
      toast({
        title: "Error",
        description: "No hay recibos para generar el fichero",
        variant: "destructive",
      });
      return;
    }

    // Format date as DDMMYY
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '');

    // Header record (1)
    let content = "5180" + // Código registro
                 "19" +    // Código de operación (adeudos SEPA)
                 "72" +    // Código de dato
                 formattedDate + // Fecha confección
                 "".padEnd(6, " ") + // Libre
                 "".padEnd(40, " ") + // Nombre del ordenante
                 "".padEnd(20, " ") + // Libre
                 "2" +     // Procedimiento
                 "\r\n";

    // Individual records
    receipts.forEach((receipt, index) => {
      const referenceNumber = (index + 1).toString().padStart(12, "0");
      const amount = (Number(receipt.amount) * 100).toString().padStart(10, "0"); // Convert to cents
      const sponsorName = receipt.sponsorship.sponsor.name.padEnd(40, " ").substring(0, 40);

      content += "5380" + // Código registro
                "19" +   // Código de operación
                "72" +   // Código de dato
                referenceNumber + // Referencia
                sponsorName +    // Nombre del titular de domiciliación
                amount +         // Importe
                formattedDate +  // Fecha de cobro
                "".padEnd(2, " ") + // Libre
                "\r\n";
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibos_${new Date().getMonth() + 1}_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Éxito",
      description: "Fichero bancario generado correctamente",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateBankFile}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Generar Fichero Bancario
    </Button>
  );
};