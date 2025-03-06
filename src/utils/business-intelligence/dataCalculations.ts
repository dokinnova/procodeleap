
// Funciones de utilidad para cálculos de datos de BI

// Calcular distribución de estados de niños
export const calculateChildrenStatusDistribution = (childrenData: any[] | undefined) => {
  if (!childrenData || childrenData.length === 0) return [];
  
  const estadosEnEspanol: { [key: string]: string } = {
    assigned: 'Apadrinado',
    assignable: 'Disponible',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    baja: 'Baja'
  };

  const distribucion = childrenData.reduce((acc: {[key: string]: number}, child) => {
    const estadoEspanol = estadosEnEspanol[child.status] || child.status;
    acc[estadoEspanol] = (acc[estadoEspanol] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(distribucion).map(([name, value]) => ({ 
    name, 
    value: value as number 
  }));
};

// Calcular contribuciones de padrinos (top 10 padrinos activos)
export const calculateSponsorContributions = (sponsorsData: any[] | undefined) => {
  if (!sponsorsData || sponsorsData.length === 0) return [];
  
  return sponsorsData
    .filter(sponsor => sponsor.status === 'active')
    .slice(0, 10)
    .map(sponsor => ({
      name: `$${sponsor.contribution.toLocaleString()}`,
      value: Number(sponsor.contribution)
    }));
};

// Calcular tendencia de apadrinamientos por mes
export const calculateSponsorshipsByMonth = (sponsorshipsData: any[] | undefined) => {
  if (!sponsorshipsData || sponsorshipsData.length === 0) return [];

  const mesesEnEspanol = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const sponsorshipsByMonth = sponsorshipsData.reduce((acc: {[key: string]: number}, sponsorship) => {
    const fecha = new Date(sponsorship.created_at);
    const mes = mesesEnEspanol[fecha.getMonth()];
    const año = fecha.getFullYear();
    const nombreMes = `${mes}/${año}`;
    acc[nombreMes] = (acc[nombreMes] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(sponsorshipsByMonth)
    .map(([name, value]) => ({ 
      name, 
      value: value as number 
    }))
    .sort((a, b) => {
      const [mesA, añoA] = a.name.split('/');
      const [mesB, añoB] = b.name.split('/');
      const indiceA = mesesEnEspanol.indexOf(mesA);
      const indiceB = mesesEnEspanol.indexOf(mesB);
      return Number(añoA) === Number(añoB) ? indiceA - indiceB : Number(añoA) - Number(añoB);
    });
};

// Calcular métricas para el dashboard
export const calculateMetrics = (
  childrenData: any[] | undefined, 
  sponsorsData: any[] | undefined, 
  sponsorshipsData: any[] | undefined
) => {
  const totalNinos = childrenData?.length || 0;
  const ninosApadrinados = childrenData?.filter(child => child.status === 'assigned').length || 0;
  
  const totalPadrinos = sponsorsData?.length || 0;
  const padrinosActivos = sponsorsData?.filter(sponsor => sponsor.status === 'active').length || 0;
  
  const totalApadrinamientos = sponsorshipsData?.length || 0;
  const totalContribuciones = sponsorsData ? 
    sponsorsData
      .filter(sponsor => sponsor.status === 'active')
      .reduce((sum, sponsor) => sum + Number(sponsor.contribution), 0) : 0;

  return {
    totalChildren: totalNinos,
    assignedChildren: ninosApadrinados,
    totalSponsors: totalPadrinos,
    activeSponsors: padrinosActivos,
    totalSponsorships: totalApadrinamientos,
    totalContributions: totalContribuciones
  };
};
