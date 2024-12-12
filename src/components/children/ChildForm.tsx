import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload } from "./PhotoUpload";

interface School {
  id: string;
  name: string;
  address: string | null;
}

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  story: string | null;
  image_url: string | null;
  school_id: string | null;
}

interface ChildFormProps {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
}

export const ChildForm = ({ selectedChild, setSelectedChild }: ChildFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<{
    name: string;
    age: number;
    location: string;
    story: string;
    school_id: string;
    image_url: string | null;
  }>({
    name: selectedChild?.name || '',
    age: selectedChild?.age || 0,
    location: selectedChild?.location || '',
    story: selectedChild?.story || '',
    school_id: selectedChild?.school_id || '',
    image_url: selectedChild?.image_url || null,
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as School[];
    }
  });

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.location) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedChild) {
        const { error } = await supabase
          .from('children')
          .update({
            name: formData.name,
            age: formData.age,
            location: formData.location,
            story: formData.story || null,
            school_id: formData.school_id || null,
            image_url: formData.image_url,
          })
          .eq('id', selectedChild.id);

        if (error) throw error;

        toast({
          title: "Niño actualizado",
          description: "Los datos se han actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('children')
          .insert([{
            name: formData.name,
            age: formData.age,
            location: formData.location,
            story: formData.story || null,
            school_id: formData.school_id || null,
            image_url: formData.image_url,
          }]);

        if (error) throw error;

        toast({
          title: "Niño registrado",
          description: "El niño se ha registrado correctamente",
        });

        setFormData({
          name: '',
          age: 0,
          location: '',
          story: '',
          school_id: '',
          image_url: null,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['children'] });
      
      if (selectedChild) {
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un error al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedChild ? 'Editar Niño' : 'Registrar Nuevo Niño'}
        </CardTitle>
        <CardDescription>
          {selectedChild 
            ? 'Modifica los datos del niño seleccionado' 
            : 'Ingresa los datos para registrar un nuevo niño'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Foto</Label>
            <PhotoUpload
              currentPhotoUrl={formData.image_url}
              onPhotoUploaded={(url) => handleInputChange('image_url', url)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Nombre del niño"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Edad</Label>
            <Input
              id="age"
              type="number"
              placeholder="Edad"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              className="w-20"
              min="0"
              max="999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              placeholder="Ubicación"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">Colegio</Label>
            <Select 
              value={formData.school_id} 
              onValueChange={(value) => handleInputChange('school_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un colegio" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Historia</Label>
            <Input
              id="story"
              placeholder="Historia del niño"
              value={formData.story}
              onChange={(e) => handleInputChange('story', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            {selectedChild && (
              <Button variant="outline" onClick={() => setSelectedChild(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {selectedChild ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};