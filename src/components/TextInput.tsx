import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Scan, Loader2, FileText } from "lucide-react";

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const TextInput = ({ text, setText, onAnalyze, isLoading }: TextInputProps) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Input Text</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to analyze whether it was written by a human or AI..."
          className="min-h-[300px] bg-card/50 border-border/50 resize-none text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing content...</span>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onAnalyze}
        disabled={!text.trim() || isLoading}
        variant="hero"
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Scan className="w-5 h-5" />
            Analyze Text
          </>
        )}
      </Button>
    </div>
  );
};
