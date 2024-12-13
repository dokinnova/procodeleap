import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Receipt {
  id: string;
  amount: number;
  sponsorship: {
    sponsor: {
      name: string;
    };
    child: {
      name: string;
    };
  };
}

interface ReceiptsTableProps {
  receipts: Receipt[];
  totalAmount: number;
}

export const ReceiptsTable = ({ receipts, totalAmount }: ReceiptsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Padrino</TableHead>
          <TableHead>Niño</TableHead>
          <TableHead className="text-right">Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell>{receipt.sponsorship.sponsor.name}</TableCell>
            <TableCell>{receipt.sponsorship.child.name}</TableCell>
            <TableCell className="text-right">${receipt.amount}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={2} className="font-bold">Total</TableCell>
          <TableCell className="text-right font-bold">${totalAmount}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};