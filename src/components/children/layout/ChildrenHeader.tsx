import { Baby, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ChildrenHeader = () => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impresión",
      description: "Se abrirá el diálogo de impresión automáticamente.",
    });
  };

  return (
    <div className="flex items-center justify-between print:hidden">
      <div className="flex items-center gap-3">
        <Baby className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Niños Registrados</h1>
      </div>
      <Button onClick={handlePrint} variant="outline">
        <Printer className="h-4 w-4 mr-2" />
        Imprimir Listado
      </Button>
    </div>
  );
};