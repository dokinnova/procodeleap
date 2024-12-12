import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface SponsorshipFormHeaderProps {
  existingSponsorship: any;
}

export const SponsorshipFormHeader = ({ existingSponsorship }: SponsorshipFormHeaderProps) => (
  <CardHeader>
    <CardTitle>
      {existingSponsorship ? 'Gestionar Apadrinamiento' : 'Nuevo Apadrinamiento'}
    </CardTitle>
    <CardDescription>
      {existingSponsorship 
        ? 'Modifica o elimina el apadrinamiento existente'
        : 'Crea un nuevo apadrinamiento'}
    </CardDescription>
  </CardHeader>
);