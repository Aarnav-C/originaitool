import { Pen, BookOpen, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingStyle {
  formality: "formal" | "informal" | "mixed";
  tone: string;
  complexity: "simple" | "moderate" | "complex";
  vocabulary: "basic" | "intermediate" | "advanced";
}

interface WritingStyleCardProps {
  style: WritingStyle;
}

export const WritingStyleCard = ({ style }: WritingStyleCardProps) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "text-success bg-success/10";
      case "moderate":
        return "text-warning bg-warning/10";
      case "complex":
        return "text-primary bg-primary/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const getVocabColor = (vocab: string) => {
    switch (vocab) {
      case "basic":
        return "text-success bg-success/10";
      case "intermediate":
        return "text-warning bg-warning/10";
      case "advanced":
        return "text-primary bg-primary/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Pen className="w-5 h-5 text-primary" />
        Writing Style Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Formality
          </div>
          <span className="inline-block px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm capitalize">
            {style.formality}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            Tone
          </div>
          <span className="inline-block px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">
            {style.tone}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            Complexity
          </div>
          <span className={cn(
            "inline-block px-3 py-1.5 rounded-full text-sm capitalize",
            getComplexityColor(style.complexity)
          )}>
            {style.complexity}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Vocabulary
          </div>
          <span className={cn(
            "inline-block px-3 py-1.5 rounded-full text-sm capitalize",
            getVocabColor(style.vocabulary)
          )}>
            {style.vocabulary}
          </span>
        </div>
      </div>
    </div>
  );
};
