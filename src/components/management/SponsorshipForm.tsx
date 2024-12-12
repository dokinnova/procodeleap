import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Child, Sponsor } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SponsorshipFormProps {
  child: Child | null;
  sponsor: Sponsor | null;
  onClose: () => void;
}

export const SponsorshipForm = ({ child, sponsor, onClose }: SponsorshipFormProps) => {
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!child || !sponsor) {
      toast({
        title: "Error",
        description: "Por favor selecciona un niño y un padrino",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para guardar el apadrinamiento
    toast({
      title: "Éxito",
      description: "Apadrinamiento actualizado correctamente",
    });
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Apadrinamiento</CardTitle>
        <CardDescription>
          Gestiona la información del apadrinamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Niño</Label>
            <Input
              value={child?.name || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Padrino</Label>
            <Input
              value={sponsor?.name || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              placeholder="Notas adicionales"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};