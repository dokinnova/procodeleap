
import { FileIcon } from "lucide-react";

interface FileTypeIconProps {
  fileType: string;
}

export const FileTypeIcon = ({ fileType }: FileTypeIconProps) => {
  if (fileType.includes('image')) {
    return <FileIcon className="h-4 w-4 text-blue-500" />;
  } else if (fileType.includes('pdf')) {
    return <FileIcon className="h-4 w-4 text-red-500" />;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <FileIcon className="h-4 w-4 text-indigo-500" />;
  } else if (fileType.includes('excel') || fileType.includes('sheet')) {
    return <FileIcon className="h-4 w-4 text-green-500" />;
  } else {
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  }
};
