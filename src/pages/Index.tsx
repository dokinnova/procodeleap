import { Users, UserPlus, School, Link as LinkIcon, Receipt, PieChart, ClipboardList, Map } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  // Fetch background settings
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Determine background style based on settings
  const getBackgroundStyle = () => {
    if (!settings) return {};
    
    if (settings.background_type === 'image' && settings.background_image) {
      return {
        backgroundImage: `url(${settings.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (settings.background_type === 'color' && settings.background_color) {
      return {
        background: settings.background_color
      };
    }
    
    // Default background if no settings
    return {
      backgroundImage: 'linear-gradient(109.6deg, rgba(253, 230, 255, 0.6) 11.2%, rgba(244, 248, 252, 1) 91.1%)'
    };
  };

  return (
    <div 
      className="min-h-screen space-y-6 p-6 max-w-6xl mx-auto" 
      style={getBackgroundStyle()}
    >
      <DashboardHeader />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardCard
          to="/children"
          icon={Users}
          title="Niños"
          description="Gestión de beneficiarios"
          variant="primary"
        />

        <DashboardCard
          to="/sponsors"
          icon={UserPlus}
          title="Padrinos"
          description="Administración de donantes"
          variant="secondary"
        />

        <DashboardCard
          to="/schools"
          icon={School}
          title="Colegios"
          description="Centros educativos"
          variant="accent"
        />

        <DashboardCard
          to="/management"
          icon={LinkIcon}
          title="Apadrinamientos"
          description="Gestión de vínculos"
          variant="primary"
        />

        <DashboardCard
          to="/receipts"
          icon={Receipt}
          title="Recibos"
          description="Control de pagos"
          variant="secondary"
        />

        <DashboardCard
          to="/tasks"
          icon={ClipboardList}
          title="Tareas"
          description="Planificación"
          variant="accent"
        />

        <DashboardCard
          to="/business-intelligence"
          icon={PieChart}
          title="Estadísticas"
          description="Análisis de datos"
          variant="primary"
        />
        
        <DashboardCard
          to="/map"
          icon={Map}
          title="Mapa"
          description="Visualización geográfica"
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default Index;
