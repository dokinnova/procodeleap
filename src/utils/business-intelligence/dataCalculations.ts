
// Utility functions for BI data calculations

// Calculate children status distribution
export const calculateChildrenStatusDistribution = (childrenData: any[] | undefined) => {
  if (!childrenData || childrenData.length === 0) return [];
  
  return Object.entries(
    childrenData.reduce((acc: {[key: string]: number}, child) => {
      const status = child.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
};

// Calculate sponsor contributions (top 10 active sponsors)
export const calculateSponsorContributions = (sponsorsData: any[] | undefined) => {
  if (!sponsorsData || sponsorsData.length === 0) return [];
  
  return sponsorsData
    .filter(sponsor => sponsor.status === 'active')
    .slice(0, 10)
    .map(sponsor => ({
      name: sponsor.contribution.toString(),
      value: Number(sponsor.contribution)
    }));
};

// Calculate sponsorships trend by month
export const calculateSponsorshipsByMonth = (sponsorshipsData: any[] | undefined) => {
  if (!sponsorshipsData || sponsorshipsData.length === 0) return [];
  
  return Object.entries(
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
  });
};

// Calculate metrics for dashboard
export const calculateMetrics = (
  childrenData: any[] | undefined, 
  sponsorsData: any[] | undefined, 
  sponsorshipsData: any[] | undefined
) => {
  const totalChildren = childrenData?.length || 0;
  const assignedChildren = childrenData?.filter(child => child.status === 'assigned').length || 0;
  
  const totalSponsors = sponsorsData?.length || 0;
  const activeSponsors = sponsorsData?.filter(sponsor => sponsor.status === 'active').length || 0;
  
  const totalSponsorships = sponsorshipsData?.length || 0;
  const totalContributions = sponsorsData ? 
    sponsorsData
      .filter(sponsor => sponsor.status === 'active')
      .reduce((sum, sponsor) => sum + Number(sponsor.contribution), 0) : 0;

  return {
    totalChildren,
    assignedChildren,
    totalSponsors,
    activeSponsors,
    totalSponsorships,
    totalContributions
  };
};
