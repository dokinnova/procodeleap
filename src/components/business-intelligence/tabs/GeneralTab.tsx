
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartDisplay } from "../charts/PieChartDisplay";
import { LineChartDisplay } from "../charts/LineChartDisplay";

interface GeneralTabProps {
  childrenStatusData: Array<{ name: string; value: number }>;
  sponsorshipsByMonth: Array<{ name: string; value: number }>;
  colors: string[];
}

export const GeneralTab = ({ 
  childrenStatusData, 
  sponsorshipsByMonth, 
  colors 
}: GeneralTabProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Niños</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartDisplay data={childrenStatusData} colors={colors} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Apadrinamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartDisplay data={sponsorshipsByMonth} />
        </CardContent>
      </Card>
    </div>
  );
};
