import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SponsorForm } from "@/components/sponsors/SponsorForm";
import { SponsorsTable } from "@/components/sponsors/SponsorsTable";
import { PaymentMethodsManager } from "@/components/sponsors/payment-methods/PaymentMethodsManager";
import { Sponsor } from "@/types";
import { useNavigate, useSearchParams } from "react-router-dom";

const Sponsors = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log("No hay sesión activa, redirigiendo a /auth");
        navigate('/auth');
        return;
      }

      setSession(currentSession);
      console.log("Sesión activa:", currentSession);
      loadSponsors();
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Cambio en el estado de autenticación:", _event, session);
      setSession(session);
      
      if (!session) {
        console.log("Sesión terminada, redirigiendo a /auth");
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Efecto para manejar el parámetro selected de la URL
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && sponsors.length > 0) {
      const sponsor = sponsors.find(s => s.id === selectedId);
      if (sponsor) {
        console.log("Padrino seleccionado desde URL:", sponsor);
        setSelectedSponsor(sponsor);
        // Limpiar el parámetro de la URL después de cargar el padrino
        navigate('/sponsors', { replace: true });
      }
    }
  }, [searchParams, sponsors, navigate]);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      console.log("Obteniendo padrinos...");
      
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
        console.log("No hay sesión al cargar padrinos");
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener padrinos:', error);
        throw error;
      }
      
      console.log("Padrinos obtenidos:", data);
      setSponsors(data || []);
    } catch (error) {
      console.error('Error al cargar padrinos:', error);
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
    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
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

      const sponsorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        contribution: Number(formData.contribution),
        status: formData.status,
      };

      console.log("Guardando datos del padrino:", sponsorData);

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
      console.error('Error al guardar padrino:', error);
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

  // Si no hay sesión, no renderizamos nada
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