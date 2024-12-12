import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SponsorForm } from "@/components/sponsors/SponsorForm";
import { SponsorsTable } from "@/components/sponsors/SponsorsTable";
import { Sponsor } from "@/types";

const Sponsors = () => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const loadSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los padrinos",
      });
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!formData.name || !formData.email || !formData.contribution) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete los campos requeridos",
      });
      return;
    }

    try {
      const sponsorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        contribution: Number(formData.contribution),
      };

      let error;
      if (selectedSponsor) {
        const { error: updateError } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', selectedSponsor.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsors')
          .insert([sponsorData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: selectedSponsor 
          ? "Padrino actualizado correctamente"
          : "Padrino registrado correctamente",
      });

      setSelectedSponsor(null);
      loadSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el padrino",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Padrinos Registrados</h1>
      </div>

      <SponsorForm
        selectedSponsor={selectedSponsor}
        onSubmit={handleSubmit}
        onCancel={() => setSelectedSponsor(null)}
      />

      <SponsorsTable
        sponsors={sponsors}
        search={search}
        onSearchChange={setSearch}
        onSponsorSelect={setSelectedSponsor}
      />
    </div>
  );
};

export default Sponsors;