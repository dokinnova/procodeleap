
import { useState } from "react";
import { PieChart, BarChart, LineChart, Activity, Users, UserPlus, FilePieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcessedBusinessData, COLORS } from "@/hooks/useProcessedBusinessData";
import { MetricCard } from "@/components/business-intelligence/MetricCard";
import { GeneralTab } from "@/components/business-intelligence/tabs/GeneralTab";
import { ChildrenTab } from "@/components/business-intelligence/tabs/ChildrenTab";
import { SponsorsTab } from "@/components/business-intelligence/tabs/SponsorsTab";

const BusinessIntelligence = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  const {
    // Datos procesados para gráficos
    childrenStatusData,
    sponsorContributionData,
    sponsorshipsByMonth,
    
    // Métricas
    totalChildren,
    assignedChildren,
    totalSponsors,
    activeSponsors,
    totalSponsorships,
    totalContributions,
    
    // Estado de carga
    isLoading
  } = useProcessedBusinessData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FilePieChart className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Business Intelligence</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Niños Registrados"
          value={totalChildren}
          subtitle={`${assignedChildren} apadrinados (${Math.round((assignedChildren / totalChildren) * 100)}%)`}
          icon={Users}
          iconColor="text-blue-500"
          gradient="from-blue-50 to-indigo-50"
        />
        
        <MetricCard
          title="Padrinos Registrados"
          value={totalSponsors}
          subtitle={`${activeSponsors} activos (${Math.round((activeSponsors / totalSponsors) * 100)}%)`}
          icon={UserPlus}
          iconColor="text-green-500"
          gradient="from-green-50 to-teal-50"
        />
        
        <MetricCard
          title="Contribución Total"
          value={`$${totalContributions.toLocaleString()}`}
          subtitle={`${totalSponsorships} apadrinamientos activos`}
          icon={Activity}
          iconColor="text-purple-500"
          gradient="from-purple-50 to-pink-50"
        />
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">
            <PieChart className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="children">
            <BarChart className="h-4 w-4 mr-2" />
            Niños
          </TabsTrigger>
          <TabsTrigger value="sponsors">
            <LineChart className="h-4 w-4 mr-2" />
            Padrinos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <GeneralTab 
            childrenStatusData={childrenStatusData}
            sponsorshipsByMonth={sponsorshipsByMonth}
            colors={COLORS}
          />
        </TabsContent>
        
        <TabsContent value="children" className="space-y-4">
          <ChildrenTab 
            childrenStatusData={childrenStatusData}
            colors={COLORS}
          />
        </TabsContent>
        
        <TabsContent value="sponsors" className="space-y-4">
          <SponsorsTab 
            sponsorContributionData={sponsorContributionData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligence;
