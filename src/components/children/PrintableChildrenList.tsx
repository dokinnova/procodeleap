import { Child } from "@/types";

interface PrintableChildrenListProps {
  children: Child[];
}

export const PrintableChildrenList = ({ children }: PrintableChildrenListProps) => {
  return (
    <div className="hidden print:block print:p-8 print:max-w-[210mm] print:mx-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-2 text-left">Nombre</th>
            <th className="py-2 text-left">Edad</th>
            <th className="py-2 text-left">Ubicación</th>
            <th className="py-2 text-left">Escuela</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id} className="border-b border-gray-300">
              <td className="py-2">{child.name}</td>
              <td className="py-2">{child.age} años</td>
              <td className="py-2">{child.location}</td>
              <td className="py-2">{child.school_id || 'No asignada'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};