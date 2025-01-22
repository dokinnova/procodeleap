import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SponsorForm } from "@/components/sponsors/SponsorForm";
import { SponsorsTable } from "@/components/sponsors/SponsorsTable";
import { PaymentMethodsManager } from "@/components/sponsors/payment-methods/PaymentMethodsManager";
import { Sponsor } from "@/types";
import { useNavigate } from "react-router-dom";

const Sponsors = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
        return;
      }
      loadSponsors();
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching sponsors...");
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sponsors:', error);
        throw error;
      }
      
      console.log("Sponsors fetched:", data);
      setSponsors(data || []);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los padrinos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para realizar esta acción",
      });
      navigate('/auth');
      return;
    }

    if (!formData.name || !formData.email || !formData.contribution || !formData.status) {
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
        phone: formData.phone || null,
        contribution: Number(formData.contribution),
        status: formData.status,
      };

      console.log("Saving sponsor data:", sponsorData);

      if (selectedSponsor) {
        const { error: updateError } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', selectedSponsor.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sponsors')
          .insert([sponsorData]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Éxito",
        description: selectedSponsor 
          ? "Padrino actualizado correctamente"
          : "Padrino registrado correctamente",
      });

      setSelectedSponsor(null);
      await loadSponsors();
    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el padrino",
      });
    }
  };

  const handleSponsorSelect = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6 container mx-auto px-4">
      <div className="flex items-center gap-3">
        <UserPlus className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Padrinos Registrados</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SponsorForm
            selectedSponsor={selectedSponsor}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedSponsor(null)}
          />

          <div className="mt-6">
            <SponsorsTable
              sponsors={sponsors}
              search={search}
              onSearchChange={setSearch}
              onSponsorSelect={handleSponsorSelect}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <PaymentMethodsManager sponsorId={selectedSponsor?.id || ""} />
        </div>
      </div>
    </div>
  );
};

export default Sponsors;