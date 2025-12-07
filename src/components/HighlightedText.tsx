import { cn } from "@/lib/utils";
import { Bot, User, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SentenceAnalysis {
  text: string;
  classification: "ai" | "human" | "uncertain";
  confidence: number;
  reason: string;
}

interface HighlightedTextProps {
  sentences: SentenceAnalysis[];
  originalText: string;
}

export const HighlightedText = ({ sentences, originalText }: HighlightedTextProps) => {
  const getClassConfig = (classification: string) => {
    switch (classification) {
      case "ai":
        return {
          bg: "bg-destructive/20",
          border: "border-b-2 border-destructive",
          icon: Bot,
          label: "AI Generated",
          color: "text-destructive",
        };
      case "human":
        return {
          bg: "bg-success/20",
          border: "border-b-2 border-success",
          icon: User,
          label: "Human Written",
          color: "text-success",
        };
      default:
        return {
          bg: "bg-warning/20",
          border: "border-b-2 border-warning",
          icon: HelpCircle,
          label: "Uncertain",
          color: "text-warning",
        };
    }
  };

  const stats = {
    ai: sentences.filter(s => s.classification === "ai").length,
    human: sentences.filter(s => s.classification === "human").length,
    uncertain: sentences.filter(s => s.classification === "uncertain").length,
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border-b-2 border-destructive" />
          <span className="text-muted-foreground">AI Generated ({stats.ai})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border-b-2 border-success" />
          <span className="text-muted-foreground">Human Written ({stats.human})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border-b-2 border-warning" />
          <span className="text-muted-foreground">Uncertain ({stats.uncertain})</span>
        </div>
      </div>

      {/* Highlighted Text */}
      <div className="glass-card rounded-xl p-4 text-sm leading-relaxed">
        <TooltipProvider>
          {sentences.map((sentence, index) => {
            const config = getClassConfig(sentence.classification);
            const Icon = config.icon;
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "cursor-pointer transition-all duration-200 px-0.5 rounded hover:opacity-80",
                      config.bg,
                      config.border
                    )}
                  >
                    {sentence.text}{" "}
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-xs bg-popover border border-border p-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", config.color)} />
                      <span className={cn("font-medium", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {sentence.confidence}% confident
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sentence.reason}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};
