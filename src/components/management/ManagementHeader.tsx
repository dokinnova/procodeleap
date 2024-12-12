import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SponsorshipForm } from "./SponsorshipForm";
import { Child, Sponsor } from "@/types";

interface ManagementHeaderProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  selectedChild: Child | null;
  selectedSponsor: Sponsor | null;
  onFormClose: () => void;
}

export const ManagementHeader = ({
  isFormOpen,
  setIsFormOpen,
  selectedChild,
  selectedSponsor,
  onFormClose,
}: ManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Apadrinamientos</h1>
        <p className="text-gray-600 mt-2">
          Administra las relaciones entre padrinos y niños
        </p>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Apadrinamiento
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <SponsorshipForm
            child={selectedChild}
            sponsor={selectedSponsor}
            onClose={onFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};