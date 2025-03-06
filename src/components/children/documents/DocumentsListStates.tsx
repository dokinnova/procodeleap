
import { FileIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const EmptyDocumentsList = () => {
  return (
    <div className="mt-4 rounded-md bg-gray-50 p-8 text-center">
      <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Sin documentos
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        No hay documentos asociados a este niño. Suba documentos usando el formulario de arriba.
      </p>
    </div>
  );
};

export const DocumentsListLoading = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Documentos</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DocumentsListError = () => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FileIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error al cargar documentos
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>No se pudieron cargar los documentos. Intente nuevamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
