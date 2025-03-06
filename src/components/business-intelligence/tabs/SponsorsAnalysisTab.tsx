
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartDisplay } from "../charts/LineChartDisplay";
import { PieChartDisplay } from "../charts/PieChartDisplay";

interface SponsorsAnalysisTabProps {
  monthlyContributions: Array<{ name: string; value: number }>;
  sponsorRetention: Array<{ name: string; value: number }>;
  colors: string[];
}

export const SponsorsAnalysisTab = ({ 
  monthlyContributions, 
  sponsorRetention,
  colors
}: SponsorsAnalysisTabProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contribuciones Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartDisplay 
            data={monthlyContributions} 
            color="#82ca9d"
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Retención de Padrinos</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartDisplay 
            data={sponsorRetention} 
            colors={colors} 
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
};
