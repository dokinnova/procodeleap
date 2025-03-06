
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartDisplay } from "../charts/BarChartDisplay";

interface ChildrenTabProps {
  childrenStatusData: Array<{ name: string; value: number }>;
  colors: string[];
}

export const ChildrenTab = ({ childrenStatusData, colors }: ChildrenTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Niños por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChartDisplay data={childrenStatusData} colors={colors} />
      </CardContent>
    </Card>
  );
};
