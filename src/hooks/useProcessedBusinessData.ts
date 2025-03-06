
import { useBusinessIntelligenceData } from "./useBusinessIntelligenceData";

// Colores para los gráficos
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const useProcessedBusinessData = () => {
  const { childrenData, sponsorsData, sponsorshipsData, isLoading } = useBusinessIntelligenceData();

  // Calcular datos para el gráfico de estado de niños
  const childrenStatusData = childrenData ? 
    Object.entries(
      childrenData.reduce((acc: {[key: string]: number}, child) => {
        const status = child.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })) : [];

  // Datos para el gráfico de contribución por padrino
  const sponsorContributionData = sponsorsData ? 
    sponsorsData
      .filter(sponsor => sponsor.status === 'active')
      .slice(0, 10)
      .map(sponsor => ({
        name: sponsor.contribution.toString(),
        value: Number(sponsor.contribution)
      })) : [];

  // Datos para el gráfico de tendencia de apadrinamientos por mes
  const sponsorshipsByMonth = sponsorshipsData ? 
    Object.entries(
      sponsorshipsData.reduce((acc: {[key: string]: number}, sponsorship) => {
        const date = new Date(sponsorship.created_at);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/').map(Number);
      const [bMonth, bYear] = b.name.split('/').map(Number);
      return aYear === bYear ? aMonth - bMonth : aYear - bYear;
    }) : [];

  // Cálculo de métricas generales
  const totalChildren = childrenData?.length || 0;
  const assignedChildren = childrenData?.filter(child => child.status === 'assigned').length || 0;
  const totalSponsors = sponsorsData?.length || 0;
  const activeSponsors = sponsorsData?.filter(sponsor => sponsor.status === 'active').length || 0;
  const totalSponsorships = sponsorshipsData?.length || 0;
  const totalContributions = sponsorsData ? 
    sponsorsData
      .filter(sponsor => sponsor.status === 'active')
      .reduce((sum, sponsor) => sum + Number(sponsor.contribution), 0) : 0;

  return {
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
  };
};
