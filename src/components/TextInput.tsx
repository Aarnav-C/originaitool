import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Scan, Loader2, FileText, Type, Hash, Clock, Trash2 } from "lucide-react";

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const TextInput = ({ text, setText, onAnalyze, isLoading }: TextInputProps) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordLength = wordCount > 0 ? (charCount / wordCount).toFixed(1) : "0";
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 words per minute

  const handleClear = () => {
    setText("");
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Input Text</h2>
        </div>
        <div className="flex items-center gap-2">
          {text.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Paste
          </Button>
        </div>
      </div>

      {/* Text Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 text-xs">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Words:</span>
          <span className="font-medium text-foreground">{wordCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 text-xs">
          <Hash className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Chars:</span>
          <span className="font-medium text-foreground">{charCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 text-xs">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Sentences:</span>
          <span className="font-medium text-foreground">{sentenceCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 text-xs">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Read:</span>
          <span className="font-medium text-foreground">{readingTime}m</span>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to analyze whether it was written by a human or AI...

For best results:
• Use at least 50 words
• Include complete sentences
• Avoid heavily formatted text"
          className="min-h-[280px] bg-card/50 border-border/50 resize-none text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing content...</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Running 8-dimensional forensic analysis
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimum text warning */}
      {text.length > 0 && wordCount < 20 && (
        <p className="text-xs text-warning flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          For accurate results, use at least 20 words ({20 - wordCount} more needed)
        </p>
      )}

      <Button
        onClick={onAnalyze}
        disabled={!text.trim() || isLoading || wordCount < 5}
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

      {wordCount >= 20 && (
        <p className="text-xs text-success flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Ready for analysis
        </p>
      )}
    </div>
  );
};
