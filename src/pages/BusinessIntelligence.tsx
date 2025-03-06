
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, BarChart, LineChart, Activity, Users, UserPlus, School, FilePieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PieChart as RechartsPC, Pie, Cell, BarChart as RechartsBC, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLC, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BusinessIntelligence = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  // Consulta para obtener los datos de los niños
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ["bi-children"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("children")
          .select("status, school_id, schools(name)")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de niños",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Consulta para obtener los datos de los padrinos
  const { data: sponsorsData, isLoading: sponsorsLoading } = useQuery({
    queryKey: ["bi-sponsors"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("status, contribution, created_at")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de padrinos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Consulta para obtener datos de apadrinamientos
  const { data: sponsorshipsData, isLoading: sponsorshipsLoading } = useQuery({
    queryKey: ["bi-sponsorships"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sponsorships")
          .select("*")
          .order("created_at");
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: "Error al cargar datos de apadrinamientos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    }
  });

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

  const isLoading = childrenLoading || sponsorsLoading || sponsorshipsLoading;

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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-blue-500" />
              Niños Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalChildren}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {assignedChildren} apadrinados ({Math.round((assignedChildren / totalChildren) * 100)}%)
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-green-500" />
              Padrinos Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSponsors}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {activeSponsors} activos ({Math.round((activeSponsors / totalSponsors) * 100)}%)
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-purple-500" />
              Contribución Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalContributions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalSponsorships} apadrinamientos activos
            </div>
          </CardContent>
        </Card>
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
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Niños</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPC>
                      <Pie
                        data={childrenStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {childrenStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPC>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Apadrinamientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLC
                      data={sponsorshipsByMonth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </RechartsLC>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="children" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Niños por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBC
                    data={childrenStatusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8">
                      {childrenStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </RechartsBC>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sponsors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribuciones por Padrino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBC
                    data={sponsorContributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </RechartsBC>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligence;
