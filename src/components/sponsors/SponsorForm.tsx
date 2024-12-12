import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sponsor } from "@/types";

interface SponsorFormProps {
  selectedSponsor: Sponsor | null;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const SponsorForm = ({ selectedSponsor, onSubmit, onCancel }: SponsorFormProps) => {
  const [formData, setFormData] = useState({
    name: selectedSponsor?.name || '',
    email: selectedSponsor?.email || '',
    phone: selectedSponsor?.phone || '',
    contribution: selectedSponsor?.contribution.toString() || '',
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'contribution') {
      // Remove any non-digit characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = cleanValue.split('.');
      let formattedValue = parts[0];
      if (parts.length > 1) {
        formattedValue += '.' + parts[1];
      }
      // Limit to 9 digits before decimal point
      if (parts[0].length > 9) {
        return;
      }
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedSponsor ? 'Editar Padrino' : 'Registrar Nuevo Padrino'}
        </CardTitle>
        <CardDescription>
          {selectedSponsor 
            ? 'Modifica los datos del padrino seleccionado' 
            : 'Ingresa los datos para registrar un nuevo padrino'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Nombre del padrino"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Contribución mensual</Label>
            <Input
              id="contribution"
              type="text"
              inputMode="decimal"
              placeholder="Contribución mensual"
              value={formData.contribution}
              onChange={(e) => handleInputChange('contribution', e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex justify-end gap-2">
            {selectedSponsor && (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {selectedSponsor ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};