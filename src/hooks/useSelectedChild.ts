
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useSelectedChild = () => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle child selection from location state (when navigating from other pages)
  useEffect(() => {
    if (location.state?.selectedChild) {
      const child = location.state.selectedChild;
      try {
        console.log('Estableciendo niño desde location state:', child);
        setSelectedChild({
          ...child,
          birth_date: child.birth_date || '',
          story: child.story || '',
          school_id: child.school_id || '',
          grade: child.grade || '',
          image_url: child.image_url || null,
          status: child.status || 'pending',
        });
      } catch (error) {
        console.error('Error al establecer el niño seleccionado:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del niño seleccionado",
          variant: "destructive",
        });
      } finally {
        // Clear location state to avoid repeated setting
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state?.selectedChild, navigate, location.pathname, toast]);

  const handleSetSelectedChild = (child: Child | null) => {
    console.log('Actualizando niño seleccionado:', child);
    if (child) {
      // Ensure all required fields are present to avoid undefined values
      setSelectedChild({
        ...child,
        birth_date: child.birth_date || '',
        story: child.story || '',
        school_id: child.school_id || '',
        grade: child.grade || '',
        image_url: child.image_url || null,
        status: child.status || 'pending',
      });
    } else {
      setSelectedChild(null);
    }
  };

  return { 
    selectedChild, 
    setSelectedChild: handleSetSelectedChild 
  };
};
