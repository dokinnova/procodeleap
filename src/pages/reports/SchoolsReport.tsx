
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { School } from "@/types";
import { generateSchoolsPdf } from "@/utils/pdf-generation/schoolsReportPdf";
import { SchoolsReportHeader } from "@/components/reports/schools/SchoolsReportHeader";
import { SchoolsSearchFilter } from "@/components/reports/schools/SchoolsSearchFilter";
import { SchoolsTable } from "@/components/reports/schools/SchoolsTable";
import { SchoolsPrintableView } from "@/components/reports/schools/SchoolsPrintableView";
import { SchoolsLoadingState } from "@/components/reports/schools/SchoolsLoadingState";

const SchoolsReport = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // Transform to match School type
      return (data || []).map(school => ({
        id: school.id,
        name: school.name,
        location: school.address || '',
        phone: '',
        email: '',
        address: school.address || ''
      })) as School[];
    },
  });

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    (school.address && school.address.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePrint = async () => {
    await generateSchoolsPdf(filteredSchools, toast);
  };

  if (isLoading) {
    return <SchoolsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <SchoolsReportHeader onGeneratePdf={handlePrint} />
      <SchoolsSearchFilter search={search} setSearch={setSearch} />
      <SchoolsTable schools={filteredSchools} />
      <SchoolsPrintableView schools={filteredSchools} />
    </div>
  );
};

export default SchoolsReport;
