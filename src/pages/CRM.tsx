import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const CRM = () => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const { data: emailBatches, refetch: refetchEmailBatches } = useQuery({
    queryKey: ["emailBatches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSendEmails = async () => {
    if (!emailContent.trim() || !emailSubject.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa el asunto y el contenido del email",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: sponsors } = await supabase
        .from("sponsors")
        .select("email, name");

      if (!sponsors?.length) {
        toast({
          title: "Error",
          description: "No hay padrinos registrados",
          variant: "destructive",
        });
        return;
      }

      // Create email batch record
      const { error: batchError } = await supabase
        .from("email_batches")
        .insert({
          subject: emailSubject,
          content: emailContent,
          recipients_count: sponsors.length,
        });

      if (batchError) throw batchError;

      const { error } = await supabase.functions.invoke("send-mass-email", {
        body: {
          recipients: sponsors.map((s) => ({ email: s.email, name: s.name })),
          subject: emailSubject,
          content: emailContent,
        },
      });

      if (error) throw error;

      // Update batch status to sent
      await supabase
        .from("email_batches")
        .update({ status: "sent" })
        .eq("subject", emailSubject)
        .eq("content", emailContent);

      toast({
        title: "Éxito",
        description: `Email enviado a ${sponsors.length} padrinos`,
      });
      setEmailSubject("");
      setEmailContent("");
      refetchEmailBatches();
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: "No se pudieron enviar los emails",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">
          Comunicación con Padrinos
        </h1>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-4">
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Asunto del email..."
            className="mb-4"
          />
          <Textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Escribe el mensaje que quieres enviar a todos los padrinos..."
            className="min-h-[200px]"
          />
          <Button
            onClick={handleSendEmails}
            disabled={isSending}
            className="w-full sm:w-auto"
          >
            {isSending ? "Enviando..." : "Enviar email a todos los padrinos"}
          </Button>
        </div>
      </div>

      <div className="mt-8">
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
                <TableRow key={batch.id}>
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
      </div>
    </div>
  );
};

export default CRM;