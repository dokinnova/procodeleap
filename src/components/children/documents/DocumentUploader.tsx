
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
              "mt-1 flex flex-col items-center justify-center border-2 border-dashed p-6 text-center",
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
                  <FileUpIcon className="h-6 w-6 text-green-500" />
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
                  className="h-8 w-8 p-0 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Eliminar archivo</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUpIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
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
                >
                  Seleccionar archivo
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Describa el contenido del documento"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button 
          type="submit" 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Subiendo..." : "Subir documento"}
        </Button>
      </div>
    </form>
  );
};
