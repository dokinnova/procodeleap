
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface TableHeaderProps {
  title: string;
  onPrintTable: () => void;
}

export const TableHeader = ({ title, onPrintTable }: TableHeaderProps) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <Button onClick={onPrintTable} variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Generar PDF
      </Button>
    </div>
  );
};
