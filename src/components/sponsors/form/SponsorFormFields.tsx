
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

interface SponsorFormFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const SponsorFormFields = ({ register, setValue, watch }: SponsorFormFieldsProps) => {
  const status = watch("status");

  return (
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
  );
};
