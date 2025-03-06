
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartDisplay } from "../charts/PieChartDisplay";
import { BarChartDisplay } from "../charts/BarChartDisplay";

interface ChildrenAnalysisTabProps {
  childrenByAge: Array<{ name: string; value: number }>;
  childrenBySchool: Array<{ name: string; value: number }>;
  colors: string[];
}

export const ChildrenAnalysisTab = ({ 
  childrenByAge, 
  childrenBySchool, 
  colors 
}: ChildrenAnalysisTabProps) => {
  // Filtrar y limitar escuelas a las top 5 para mejor visualización
  const topSchools = childrenBySchool
    .slice(0, 5)
    .map(item => ({
      name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
      value: item.value
    }));
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Niños por Edad</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartDisplay 
            data={childrenByAge} 
            singleColor="#0088FE" 
            height={300}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Escuela (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartDisplay 
            data={topSchools} 
            colors={colors} 
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
};
