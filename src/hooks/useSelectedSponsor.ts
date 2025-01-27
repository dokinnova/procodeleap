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
        navigate('/sponsors', { replace: true });
      }
    }
  }, [searchParams, sponsors, navigate]);

  return {
    selectedSponsor,
    setSelectedSponsor,
  };
};