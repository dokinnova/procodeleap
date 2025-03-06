
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartDisplay } from "../charts/BarChartDisplay";

interface SponsorsTabProps {
  sponsorContributionData: Array<{ name: string; value: number }>;
}

export const SponsorsTab = ({ sponsorContributionData }: SponsorsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribuciones por Padrino</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChartDisplay 
          data={sponsorContributionData} 
          singleColor="#82ca9d" 
        />
      </CardContent>
    </Card>
  );
};
