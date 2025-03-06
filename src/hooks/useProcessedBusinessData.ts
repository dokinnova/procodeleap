
import { useBusinessIntelligenceData } from "./useBusinessIntelligenceData";
import { 
  calculateChildrenStatusDistribution,
  calculateSponsorContributions,
  calculateSponsorshipsByMonth,
  calculateMetrics
} from "@/utils/business-intelligence/dataCalculations";

// Colores para los gráficos
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const useProcessedBusinessData = () => {
  const { childrenData, sponsorsData, sponsorshipsData, isLoading } = useBusinessIntelligenceData();

  // Calcular datos para el gráfico de estado de niños
  const childrenStatusData = calculateChildrenStatusDistribution(childrenData);

  // Datos para el gráfico de contribución por padrino
  const sponsorContributionData = calculateSponsorContributions(sponsorsData);

  // Datos para el gráfico de tendencia de apadrinamientos por mes
  const sponsorshipsByMonth = calculateSponsorshipsByMonth(sponsorshipsData);

  // Cálculo de métricas generales
  const metrics = calculateMetrics(childrenData, sponsorsData, sponsorshipsData);

  return {
    // Datos procesados para gráficos
    childrenStatusData,
    sponsorContributionData,
    sponsorshipsByMonth,
    
    // Métricas
    ...metrics,
    
    // Estado de carga
    isLoading
  };
};
