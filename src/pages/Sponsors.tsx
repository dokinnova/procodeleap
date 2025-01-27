import { useState } from "react";
import { UserPlus } from "lucide-react";
import { SponsorForm } from "@/components/sponsors/SponsorForm";
import { SponsorsTable } from "@/components/sponsors/SponsorsTable";
import { PaymentMethodsManager } from "@/components/sponsors/payment-methods/PaymentMethodsManager";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSponsors } from "@/hooks/useSponsors";
import { useSelectedSponsor } from "@/hooks/useSelectedSponsor";

const Sponsors = () => {
  const session = useAuthSession();
  const { sponsors, isLoading, loadSponsors, handleSubmit } = useSponsors();
  const { selectedSponsor, setSelectedSponsor, handleSponsorSelect } = useSelectedSponsor(sponsors);
  const [search, setSearch] = useState("");

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