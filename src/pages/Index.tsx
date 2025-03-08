
import { Users, UserPlus, School, Link as LinkIcon, Receipt, PieChart, ClipboardList } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const Index = () => {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
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
      </div>
    </div>
  );
};

export default Index;
