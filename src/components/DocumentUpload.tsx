import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, File, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentUploadProps {
  onTextExtracted: (text: string) => void;
  isLoading?: boolean;
}

export const DocumentUpload = ({ onTextExtracted, isLoading }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = [
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📃";
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    setExtracting(true);
    try {
      // For plain text files
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        return text;
      }

      // For PDF and DOCX, we'll read as text (basic extraction)
      // In a production app, you'd use a proper parser
      const text = await file.text();
      
      // Basic cleanup for binary content
      const cleanedText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanedText.length < 50) {
        throw new Error("Could not extract readable text from this file format. Please try copying and pasting the text directly.");
      }

      return cleanedText;
    } finally {
      setExtracting(false);
    }
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setFile(file);
    setExtracted(false);

    try {
      const text = await extractTextFromFile(file);
      onTextExtracted(text);
      setExtracted(true);
      toast.success(`Extracted ${text.split(/\s+/).length} words from ${file.name}`);
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to extract text");
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setExtracted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Upload Document</h3>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border/50 hover:border-primary/50 hover:bg-secondary/30"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              isDragging ? "bg-primary/20" : "bg-secondary"
            )}>
              <FileText className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop file here" : "Drop file or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                TXT, PDF, DOC, DOCX (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                {getFileIcon(file.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {extracting && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
              {extracted && (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {extracted && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Text extracted and ready for analysis
            </p>
          )}
        </div>
      )}
    </div>
  );
};
