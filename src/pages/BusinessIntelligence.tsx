
import { useState } from "react";
import { PieChart, BarChart, LineChart, FilePieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcessedBusinessData, COLORS } from "@/hooks/useProcessedBusinessData";
import { GeneralTab } from "@/components/business-intelligence/tabs/GeneralTab";
import { ChildrenTab } from "@/components/business-intelligence/tabs/ChildrenTab";
import { SponsorsTab } from "@/components/business-intelligence/tabs/SponsorsTab";
import { ChildrenMetricCard } from "@/components/business-intelligence/metrics/ChildrenMetricCard";
import { SponsorsMetricCard } from "@/components/business-intelligence/metrics/SponsorsMetricCard";
import { ContributionsMetricCard } from "@/components/business-intelligence/metrics/ContributionsMetricCard";

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
        <ChildrenMetricCard 
          totalChildren={totalChildren} 
          assignedChildren={assignedChildren} 
        />
        
        <SponsorsMetricCard 
          totalSponsors={totalSponsors} 
          activeSponsors={activeSponsors} 
        />
        
        <ContributionsMetricCard 
          totalContributions={totalContributions} 
          totalSponsorships={totalSponsorships} 
        />
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2 text-base font-medium transition-all">
            <PieChart className="h-5 w-5" />
            General
          </TabsTrigger>
          <TabsTrigger value="children" className="flex items-center gap-2 text-base font-medium transition-all">
            <BarChart className="h-5 w-5" />
            Niños
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="flex items-center gap-2 text-base font-medium transition-all">
            <LineChart className="h-5 w-5" />
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
