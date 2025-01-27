import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sponsor } from "@/types";

export const useSelectedSponsor = (sponsors: Sponsor[]) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && sponsors.length > 0) {
      const sponsor = sponsors.find(s => s.id === selectedId);
      if (sponsor) {
        console.log("Padrino seleccionado desde URL:", sponsor);
        setSelectedSponsor(sponsor);
      }
    }
  }, [searchParams, sponsors]);

  const handleSponsorSelect = (sponsor: Sponsor) => {
    console.log("Seleccionando padrino:", sponsor);
    setSelectedSponsor(sponsor);
  };

  return {
    selectedSponsor,
    setSelectedSponsor,
    handleSponsorSelect
  };
};