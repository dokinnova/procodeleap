
import { 
  FileIcon, 
  FileImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileCodeIcon,
  FileType2
} from "lucide-react";

interface FileTypeIconProps {
  fileType: string;
}

export const FileTypeIcon = ({ fileType }: FileTypeIconProps) => {
  // Detectar el tipo de archivo por su MIME type
  if (fileType.includes('image')) {
    return <FileImageIcon className="h-4 w-4 text-blue-500" />;
  } else if (fileType.includes('pdf')) {
    return <FileType2 className="h-4 w-4 text-red-500" />;
  } else if (fileType.includes('word') || fileType.includes('document') || fileType.includes('text/')) {
    return <FileTextIcon className="h-4 w-4 text-indigo-500" />;
  } else if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) {
    return <FileSpreadsheetIcon className="h-4 w-4 text-green-500" />;
  } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) {
    return <FileArchiveIcon className="h-4 w-4 text-yellow-500" />;
  } else if (fileType.includes('audio')) {
    return <FileAudioIcon className="h-4 w-4 text-purple-500" />;
  } else if (fileType.includes('video')) {
    return <FileVideoIcon className="h-4 w-4 text-pink-500" />;
  } else if (fileType.includes('code') || fileType.includes('html') || fileType.includes('javascript') || fileType.includes('css')) {
    return <FileCodeIcon className="h-4 w-4 text-gray-700" />;
  } else {
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  }
};
