import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailFormProps {
  onEmailSent: () => void;
}

export const EmailForm = ({ onEmailSent }: EmailFormProps) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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
      onEmailSent();
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
  );
};