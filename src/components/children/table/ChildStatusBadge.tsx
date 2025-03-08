
interface ChildStatusBadgeProps {
  status: string;
}

export const ChildStatusBadge = ({ status }: ChildStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-800';
      case 'assignable':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'assigned':
        return 'Asignado';
      case 'assignable':
        return 'Asignable';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      case 'baja':
        return 'Baja';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
};
