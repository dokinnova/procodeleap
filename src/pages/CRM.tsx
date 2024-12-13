import { Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailForm } from "@/components/crm/EmailForm";
import { EmailHistory } from "@/components/crm/EmailHistory";

const CRM = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">
          Comunicación con Padrinos
        </h1>
      </div>

      <EmailForm onEmailSent={refetchEmailBatches} />

      <EmailHistory emailBatches={emailBatches || []} />
    </div>
  );
};

export default CRM;