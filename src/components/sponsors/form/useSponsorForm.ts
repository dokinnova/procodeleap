
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sponsor } from "@/types";

export const useSponsorForm = (selectedSponsor: Sponsor | null) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      mobile_phone: "",
      address: "",
      city: "",
      country: "",
      contribution: "",
      status: "pending",
    },
  });

  useEffect(() => {
    if (selectedSponsor) {
      reset({
        first_name: selectedSponsor.first_name,
        last_name: selectedSponsor.last_name,
        email: selectedSponsor.email,
        phone: selectedSponsor.phone || "",
        mobile_phone: selectedSponsor.mobile_phone || "",
        address: selectedSponsor.address || "",
        city: selectedSponsor.city || "",
        country: selectedSponsor.country || "",
        contribution: selectedSponsor.contribution.toString(),
        status: selectedSponsor.status,
      });
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        mobile_phone: "",
        address: "",
        city: "",
        country: "",
        contribution: "",
        status: "pending",
      });
    }
  }, [selectedSponsor, reset]);

  return {
    register,
    handleSubmit,
    setValue,
    watch,
  };
};
