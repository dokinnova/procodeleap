
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Sponsor } from '@/types';

export const useSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to load sponsors from the database
  const loadSponsors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add the missing image_url field that's required by the type
      const sponsorsWithImageUrl = data.map(sponsor => ({
        ...sponsor,
        image_url: null
      })) as Sponsor[];

      setSponsors(sponsorsWithImageUrl);
    } catch (error: any) {
      console.error('Error loading sponsors:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los padrinos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Function to handle form submission (create/update sponsor)
  const handleSubmit = useCallback(async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        // Update existing sponsor
        const { error } = await supabase
          .from('sponsors')
          .update(formData)
          .eq('id', formData.id);

        if (error) throw error;

        toast({
          title: 'Padrino actualizado',
          description: 'Los datos del padrino han sido actualizados correctamente',
        });
      } else {
        // Create new sponsor
        const { error } = await supabase
          .from('sponsors')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Padrino registrado',
          description: 'El padrino ha sido registrado correctamente',
        });
      }

      // Refresh sponsors list
      loadSponsors();
      return true;
    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la información del padrino',
        variant: 'destructive',
      });
      return false;
    }
  }, [loadSponsors, toast]);

  return {
    sponsors,
    isLoading,
    loadSponsors,
    handleSubmit,
  };
};
