import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useSelectedChild = () => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.selectedChild) {
      const child = location.state.selectedChild;
      try {
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
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state?.selectedChild, navigate, location.pathname, toast]);

  return { selectedChild, setSelectedChild };
};