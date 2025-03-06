import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileUpIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploaderProps {
  onUpload: (file: File, description: string) => void;
  isUploading: boolean;
}

export const DocumentUploader = ({ onUpload, isUploading }: DocumentUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file, description);
      setFile(null);
      setDescription("");
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="document">Documento</Label>
          <Card
            className={cn(
              "mt-1 flex flex-col items-center justify-center border-2 border-dashed p-4 text-center",
              dragActive ? "border-primary bg-primary/10" : "border-gray-300",
              file ? "border-green-500 bg-green-50" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileUpIcon className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="h-7 w-7 p-0 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Eliminar archivo</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <FileUpIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">
                    Arrastre y suelte o haga clic para subir
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Soporte para PDF, DOCX, XLSX, JPG, PNG
                  </p>
                </div>
                <Input
                  id="document"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("document")?.click()}
                  className="text-xs py-1 h-7"
                >
                  Seleccionar archivo
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label htmlFor="description" className="text-xs">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describa el contenido del documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 text-xs h-8 resize-none py-1"
            />
          </div>

          <Button 
            type="submit" 
            disabled={!file || isUploading}
            className="mt-6 h-10 px-4 text-sm"
          >
            {isUploading ? "Subiendo..." : "Subir"}
          </Button>
        </div>
      </div>
    </form>
  );
};
