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
import { useQueryClient } from "@tanstack/react-query";

interface SponsorshipFormProps {
  child: Child | null;
  sponsor: Sponsor | null;
  onClose: () => void;
}

export const SponsorshipForm = ({ child, sponsor, onClose }: SponsorshipFormProps) => {
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!child || !sponsor || !startDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('sponsorships')
        .insert([
          {
            child_id: child.id,
            sponsor_id: sponsor.id,
            start_date: startDate,
            notes: notes || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Apadrinamiento creado correctamente",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["children"] });

      onClose();
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el apadrinamiento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Label htmlFor="startDate">Fecha de inicio *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
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
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};