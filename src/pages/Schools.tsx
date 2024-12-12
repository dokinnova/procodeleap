import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { School, Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Schools = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");

  // Fetch schools data
  const { data: schools, refetch } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Add new school
  const handleAddSchool = async () => {
    try {
      const { error } = await supabase.from("schools").insert([
        {
          name: newSchoolName,
          address: newSchoolAddress,
        },
      ]);

      if (error) throw error;

      toast.success("Colegio añadido correctamente");
      setIsAddDialogOpen(false);
      setNewSchoolName("");
      setNewSchoolAddress("");
      refetch();
    } catch (error) {
      console.error("Error adding school:", error);
      toast.error("Error al añadir el colegio");
    }
  };

  // Delete school
  const handleDeleteSchool = async (id: string) => {
    try {
      const { error } = await supabase.from("schools").delete().eq("id", id);

      if (error) throw error;

      toast.success("Colegio eliminado correctamente");
      refetch();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error("Error al eliminar el colegio");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Gestión de Colegios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Colegios</h1>
          <p className="text-muted-foreground">
            Administra los colegios registrados en el sistema
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Colegio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Colegio</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo colegio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Nombre del colegio"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newSchoolAddress}
                  onChange={(e) => setNewSchoolAddress(e.target.value)}
                  placeholder="Dirección del colegio"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSchool}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Colegios Registrados</CardTitle>
          <CardDescription>
            Lista de todos los colegios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools?.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.address}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schools;