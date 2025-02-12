
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { useDeleteSponsor } from "@/hooks/useDeleteSponsor";
import { Sponsor } from "@/types";

interface SponsorFormProps {
  selectedSponsor: Sponsor | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const SponsorForm = ({ selectedSponsor, onSubmit, onCancel }: SponsorFormProps) => {
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

  const { sponsorToDelete, setSponsorToDelete, handleDelete } = useDeleteSponsor();
  const status = watch("status");

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

  const handleDeleteClick = () => {
    if (selectedSponsor) {
      setSponsorToDelete(selectedSponsor);
    }
  };

  const handleConfirmDelete = async () => {
    if (sponsorToDelete) {
      await handleDelete(sponsorToDelete.id);
      onCancel();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            {selectedSponsor ? "Editar Padrino" : "Registrar Nuevo Padrino"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="Nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="Apellidos"
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
                <Label htmlFor="phone">Teléfono Fijo</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Teléfono fijo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Teléfono Móvil</Label>
                <Input
                  id="mobile_phone"
                  {...register("mobile_phone")}
                  placeholder="Teléfono móvil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Dirección"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Ciudad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  {...register("country")}
                  placeholder="País"
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

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              {selectedSponsor && (
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={handleDeleteClick}
                  className="px-8"
                >
                  Eliminar Padrino
                </Button>
              )}
              <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" size="lg">
                {selectedSponsor ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={!!sponsorToDelete}
        onClose={() => setSponsorToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el padrino ${sponsorToDelete?.first_name} ${sponsorToDelete?.last_name}.`}
      />
    </>
  );
};
