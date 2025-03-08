
import { useState } from "react";
import { Sponsor } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, MessageSquare } from "lucide-react";

export const WhatsAppContact = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const { toast } = useToast();

  // Cargar la lista de padrinos
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      
      // Añadir el campo image_url requerido por el tipo Sponsor
      return data.map(sponsor => ({
        ...sponsor,
        image_url: null
      })) as Sponsor[];
    },
  });

  // Filtrar padrinos por búsqueda
  const filteredSponsors = sponsors?.filter(sponsor => 
    `${sponsor.first_name} ${sponsor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sponsor.mobile_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Función para abrir WhatsApp con un número y mensaje
  const openWhatsApp = (phoneNumber: string) => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Este padrino no tiene número de teléfono móvil registrado",
        variant: "destructive",
      });
      return;
    }

    // Formatear el número de teléfono (mantener el + si existe, pero eliminar espacios)
    const formattedPhone = phoneNumber.replace(/\s+/g, "");
    
    // Construir URL de WhatsApp
    const message = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone}?text=${message}`;
    
    // Abrir en una nueva pestaña
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Mensaje de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Escribe el mensaje que quieres enviar por WhatsApp..."
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="min-h-[100px] mb-4"
          />
        </CardContent>
      </Card>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Buscar padrino por nombre o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Padrinos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando padrinos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono Móvil</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSponsors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No se encontraron padrinos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSponsors.map((sponsor) => (
                    <TableRow key={sponsor.id}>
                      <TableCell className="font-medium">
                        {`${sponsor.first_name} ${sponsor.last_name}`}
                      </TableCell>
                      <TableCell>{sponsor.mobile_phone || "No disponible"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openWhatsApp(sponsor.mobile_phone || "")}
                          disabled={!sponsor.mobile_phone}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
