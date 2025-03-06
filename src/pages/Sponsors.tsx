
import { useState, useEffect } from "react";
import { UserPlus, List, Edit } from "lucide-react";
import { SponsorForm } from "@/components/sponsors/SponsorForm";
import { SponsorsTable } from "@/components/sponsors/SponsorsTable";
import { PaymentMethodsManager } from "@/components/sponsors/payment-methods/PaymentMethodsManager";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSponsors } from "@/hooks/useSponsors";
import { useSelectedSponsor } from "@/hooks/useSelectedSponsor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sponsors = () => {
  const session = useAuthSession();
  const { sponsors, isLoading, loadSponsors, handleSubmit } = useSponsors();
  const { selectedSponsor, setSelectedSponsor, handleSponsorSelect } = useSelectedSponsor(sponsors);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("list");

  useEffect(() => {
    if (session) {
      console.log("Cargando padrinos inicialmente...");
      loadSponsors();
    }
  }, [session, loadSponsors]);

  // Cuando se selecciona un padrino, cambiar a la pestaña de edición
  useEffect(() => {
    if (selectedSponsor) {
      setActiveTab("edit");
    }
  }, [selectedSponsor]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" /> Buscar Padrinos
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> {selectedSponsor ? `Editar: ${selectedSponsor.first_name} ${selectedSponsor.last_name}` : 'Registrar Padrino'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <SponsorsTable
            sponsors={sponsors}
            search={search}
            onSearchChange={setSearch}
            onSponsorSelect={handleSponsorSelect}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <SponsorForm
                selectedSponsor={selectedSponsor}
                onSubmit={handleSubmit}
                onCancel={() => setSelectedSponsor(null)}
              />
            </div>

            <div className="lg:col-span-4">
              {selectedSponsor && (
                <PaymentMethodsManager sponsorId={selectedSponsor?.id || ""} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sponsors;
