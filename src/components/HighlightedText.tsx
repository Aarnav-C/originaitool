import { cn } from "@/lib/utils";
import { Bot, User, HelpCircle, AlertTriangle, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SentenceAnalysis } from "@/types/analysis";

interface HighlightedTextProps {
  sentences: SentenceAnalysis[];
  originalText: string;
}

export const HighlightedText = ({ sentences, originalText }: HighlightedTextProps) => {
  const getClassConfig = (classification: string, confidence: number) => {
    const isHighConfidence = confidence >= 80;
    const isMediumConfidence = confidence >= 60;
    
    switch (classification) {
      case "ai":
        return {
          bg: isHighConfidence ? "bg-destructive/30" : "bg-destructive/15",
          border: isHighConfidence ? "border-b-2 border-destructive" : "border-b border-destructive/60",
          icon: Bot,
          label: "AI Generated",
          color: "text-destructive",
          confidenceLabel: isHighConfidence ? "High confidence" : isMediumConfidence ? "Medium confidence" : "Low confidence"
        };
      case "human":
        return {
          bg: isHighConfidence ? "bg-success/30" : "bg-success/15",
          border: isHighConfidence ? "border-b-2 border-success" : "border-b border-success/60",
          icon: User,
          label: "Human Written",
          color: "text-success",
          confidenceLabel: isHighConfidence ? "High confidence" : isMediumConfidence ? "Medium confidence" : "Low confidence"
        };
      default:
        return {
          bg: "bg-warning/20",
          border: "border-b-2 border-dashed border-warning",
          icon: HelpCircle,
          label: "Uncertain",
          color: "text-warning",
          confidenceLabel: "Cannot determine"
        };
    }
  };

  const stats = {
    ai: sentences.filter(s => s.classification === "ai").length,
    human: sentences.filter(s => s.classification === "human").length,
    uncertain: sentences.filter(s => s.classification === "uncertain").length,
  };

  const total = sentences.length;
  const aiPercent = total > 0 ? Math.round((stats.ai / total) * 100) : 0;
  const humanPercent = total > 0 ? Math.round((stats.human / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
            <div 
              className="h-full bg-destructive transition-all duration-500" 
              style={{ width: `${aiPercent}%` }} 
            />
            <div 
              className="h-full bg-warning transition-all duration-500" 
              style={{ width: `${(stats.uncertain / total) * 100}%` }} 
            />
            <div 
              className="h-full bg-success transition-all duration-500" 
              style={{ width: `${humanPercent}%` }} 
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-destructive font-medium">{stats.ai} AI</span>
          <span className="text-warning font-medium">{stats.uncertain} ?</span>
          <span className="text-success font-medium">{stats.human} Human</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/30 border-b-2 border-destructive" />
          <span className="text-muted-foreground">AI ({aiPercent}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/30 border-b-2 border-success" />
          <span className="text-muted-foreground">Human ({humanPercent}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/20 border-b-2 border-dashed border-warning" />
          <span className="text-muted-foreground">Uncertain</span>
        </div>
      </div>

      {/* Highlighted Text */}
      <div className="glass-card rounded-xl p-4 text-sm leading-relaxed max-h-[400px] overflow-y-auto">
        <TooltipProvider delayDuration={100}>
          {sentences.map((sentence, index) => {
            const config = getClassConfig(sentence.classification, sentence.confidence);
            const Icon = config.icon;
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "cursor-pointer transition-all duration-200 px-0.5 rounded hover:opacity-80 inline",
                      config.bg,
                      config.border
                    )}
                  >
                    {sentence.text}{" "}
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-sm bg-popover border border-border p-4 shadow-xl"
                  sideOffset={8}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div>
                          <span className={cn("font-semibold block", config.color)}>
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {config.confidenceLabel}
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold px-2 py-0.5 rounded",
                        config.bg, config.color
                      )}>
                        {sentence.confidence}%
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {sentence.reason}
                    </p>

                    {/* Signals */}
                    {sentence.signals && sentence.signals.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 mb-2">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">Detection Signals</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sentence.signals.map((signal, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Low confidence warning */}
      {sentences.some(s => s.confidence < 60) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-warning">
            Some sentences have low confidence scores. Results may be less reliable for these sections.
          </p>
        </div>
      )}
    </div>
  );
};
