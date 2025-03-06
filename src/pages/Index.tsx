
import { Users, UserPlus, School, Link as LinkIcon, Receipt, PieChart } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const Index = () => {
  return (
    <div className="space-y-6 p-4">
      <DashboardHeader />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          to="/children"
          icon={Users}
          title="Gestión de Niños"
          description="Administra los registros de niños"
          variant="primary"
        />

        <DashboardCard
          to="/sponsors"
          icon={UserPlus}
          title="Gestión de Padrinos"
          description="Administra los padrinos y donaciones"
          variant="secondary"
        />

        <DashboardCard
          to="/schools"
          icon={School}
          title="Gestión de Colegios"
          description="Administra los colegios registrados"
          variant="accent"
        />

        <DashboardCard
          to="/management"
          icon={LinkIcon}
          title="Gestión de Apadrinamientos"
          description="Administra los vínculos entre padrinos y niños"
          variant="primary"
        />

        <DashboardCard
          to="/receipts"
          icon={Receipt}
          title="Gestión de Recibos"
          description="Administra los recibos y pagos"
          variant="secondary"
        />

        <DashboardCard
          to="/business-intelligence"
          icon={PieChart}
          title="Business Intelligence"
          description="Visualización de datos y métricas"
          variant="accent"
        />
      </div>
    </div>
  );
};

export default Index;
