import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface EmailBatch {
  id: string;
  subject: string;
  content: string;
  recipients_count: number;
  status: "pending" | "sent" | "failed";
  sent_at: string;
  created_at: string;
}

interface EmailHistoryProps {
  emailBatches: EmailBatch[];
}

export const EmailHistory = ({ emailBatches }: EmailHistoryProps) => {
  const [selectedEmail, setSelectedEmail] = useState<null | {
    subject: string;
    content: string;
    sent_at: string;
  }>(null);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Historial de Emails</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Fecha de Envío</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead className="text-right">Destinatarios</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailBatches?.map((batch, index) => (
              <TableRow
                key={batch.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setSelectedEmail({
                    subject: batch.subject,
                    content: batch.content,
                    sent_at: batch.sent_at || batch.created_at,
                  })
                }
              >
                <TableCell>{emailBatches.length - index}</TableCell>
                <TableCell>
                  {format(new Date(batch.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{batch.subject}</TableCell>
                <TableCell className="text-right">
                  {batch.recipients_count}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      batch.status === "sent"
                        ? "bg-green-50 text-green-700"
                        : batch.status === "failed"
                        ? "bg-red-50 text-red-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {batch.status === "sent"
                      ? "Enviado"
                      : batch.status === "failed"
                      ? "Fallido"
                      : "Pendiente"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedEmail?.subject}</DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Enviado el{" "}
              {selectedEmail &&
                format(new Date(selectedEmail.sent_at), "dd/MM/yyyy HH:mm")}
            </div>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap">{selectedEmail?.content}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};