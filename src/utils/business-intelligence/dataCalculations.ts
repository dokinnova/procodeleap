
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
    value: Number(value) 
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
      value: Number(value) 
    }))
    .sort((a, b) => {
      const [mesA, añoA] = a.name.split('/');
      const [mesB, añoB] = b.name.split('/');
      const indiceA = mesesEnEspanol.indexOf(mesA);
      const indiceB = mesesEnEspanol.indexOf(mesB);
      return Number(añoA) === Number(añoB) ? indiceA - indiceB : Number(añoA) - Number(añoB);
    });
};

// Calcular distribución de niños por edad
export const calculateChildrenByAge = (childrenData: any[] | undefined) => {
  if (!childrenData || childrenData.length === 0) return [];
  
  const edades = childrenData.reduce((acc: { [key: string]: number }, child) => {
    const edad = child.age || 'No especificada';
    acc[edad] = (acc[edad] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(edades)
    .map(([name, value]) => ({ 
      name: `${name} años`, 
      value: Number(value) 
    }))
    .sort((a, b) => {
      const edadA = parseInt(a.name);
      const edadB = parseInt(b.name);
      return isNaN(edadA) || isNaN(edadB) ? 0 : edadA - edadB;
    });
};

// Calcular distribución de niños por escuela
export const calculateChildrenBySchool = (childrenData: any[] | undefined) => {
  if (!childrenData || childrenData.length === 0) return [];
  
  const escuelas = childrenData.reduce((acc: { [key: string]: number }, child) => {
    const escuela = child.schools?.name || 'Sin escuela';
    acc[escuela] = (acc[escuela] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(escuelas)
    .map(([name, value]) => ({ 
      name, 
      value: Number(value) 
    }))
    .sort((a, b) => b.value - a.value);
};

// Calcular tendencia de contribuciones mensuales
export const calculateMonthlyContributions = (sponsorsData: any[] | undefined, sponsorshipsData: any[] | undefined) => {
  if (!sponsorsData || !sponsorshipsData || sponsorsData.length === 0 || sponsorshipsData.length === 0) return [];

  const mesesEnEspanol = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  // Crear mapa de contribuciones por padrino
  const sponsorContributions = sponsorsData.reduce((acc: { [key: string]: number }, sponsor) => {
    acc[sponsor.id] = Number(sponsor.contribution);
    return acc;
  }, {});
  
  // Calcular contribuciones por mes
  const contributionsByMonth = sponsorshipsData.reduce((acc: { [key: string]: number }, sponsorship) => {
    const fecha = new Date(sponsorship.created_at);
    const mes = mesesEnEspanol[fecha.getMonth()];
    const año = fecha.getFullYear();
    const nombreMes = `${mes}/${año}`;
    const contribucion = sponsorContributions[sponsorship.sponsor_id] || 0;
    
    acc[nombreMes] = (acc[nombreMes] || 0) + contribucion;
    return acc;
  }, {});

  return Object.entries(contributionsByMonth)
    .map(([name, value]) => ({ 
      name, 
      value: Number(value) 
    }))
    .sort((a, b) => {
      const [mesA, añoA] = a.name.split('/');
      const [mesB, añoB] = b.name.split('/');
      const indiceA = mesesEnEspanol.indexOf(mesA);
      const indiceB = mesesEnEspanol.indexOf(mesB);
      return Number(añoA) === Number(añoB) ? indiceA - indiceB : Number(añoA) - Number(añoB);
    });
};

// Calcular tasa de retención de padrinos (cuánto tiempo permanecen activos)
export const calculateSponsorRetention = (sponsorsData: any[] | undefined) => {
  if (!sponsorsData || sponsorsData.length === 0) return [];
  
  const ahora = new Date();
  const mesesDeActividad = sponsorsData
    .filter(sponsor => sponsor.status === 'active')
    .reduce((acc: { [key: string]: number }, sponsor) => {
      const fechaCreacion = new Date(sponsor.created_at);
      const diferenciaMeses = Math.floor(
        (ahora.getFullYear() - fechaCreacion.getFullYear()) * 12 + 
        (ahora.getMonth() - fechaCreacion.getMonth())
      );
      
      // Agrupar en rangos
      let rango = '';
      if (diferenciaMeses < 3) rango = '0-3 meses';
      else if (diferenciaMeses < 6) rango = '3-6 meses';
      else if (diferenciaMeses < 12) rango = '6-12 meses';
      else if (diferenciaMeses < 24) rango = '1-2 años';
      else rango = 'Más de 2 años';
      
      acc[rango] = (acc[rango] || 0) + 1;
      return acc;
    }, {});

  // Ordenar los rangos
  const ordenRangos = [
    '0-3 meses',
    '3-6 meses',
    '6-12 meses',
    '1-2 años',
    'Más de 2 años'
  ];

  return Object.entries(mesesDeActividad)
    .map(([name, value]) => ({ 
      name, 
      value: Number(value) 
    }))
    .sort((a, b) => ordenRangos.indexOf(a.name) - ordenRangos.indexOf(b.name));
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
