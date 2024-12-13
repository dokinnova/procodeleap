import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sponsor } from "@/types";

interface SponsorFormProps {
  selectedSponsor: Sponsor | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const SponsorForm = ({ selectedSponsor, onSubmit, onCancel }: SponsorFormProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      contribution: "",
    },
  });

  useEffect(() => {
    if (selectedSponsor) {
      reset({
        name: selectedSponsor.name,
        email: selectedSponsor.email,
        phone: selectedSponsor.phone || "",
        contribution: selectedSponsor.contribution.toString(),
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        contribution: "",
      });
    }
  }, [selectedSponsor, reset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedSponsor ? "Editar Padrino" : "Registrar Nuevo Padrino"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="Número de teléfono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Contribución Mensual ($)</Label>
            <Input
              id="contribution"
              type="number"
              step="0.01"
              {...register("contribution")}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {selectedSponsor ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};