import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIHumanMeterProps {
  aiPercentage: number;
  humanPercentage: number;
  classification: "AI-Generated" | "Human-Written" | "Hybrid";
}

export const AIHumanMeter = ({ aiPercentage, humanPercentage, classification }: AIHumanMeterProps) => {
  const ai = aiPercentage || 50;
  const human = humanPercentage || 50;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-6 text-center">
        Content Origin Distribution
      </h4>

      {/* Main Meter */}
      <div className="relative mb-6">
        <div className="h-8 rounded-full bg-secondary overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-destructive to-destructive/80 transition-all duration-1000 flex items-center justify-end pr-2"
            style={{ width: `${ai}%` }}
          >
            {ai > 15 && (
              <span className="text-xs font-bold text-destructive-foreground">{ai}%</span>
            )}
          </div>
          <div
            className="h-full bg-gradient-to-r from-success/80 to-success transition-all duration-1000 flex items-center justify-start pl-2"
            style={{ width: `${human}%` }}
          >
            {human > 15 && (
              <span className="text-xs font-bold text-success-foreground">{human}%</span>
            )}
          </div>
        </div>
        
        {/* Indicator Line */}
        <div 
          className="absolute top-0 h-8 w-0.5 bg-foreground/50"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Bot className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">AI Content</div>
            <div className="text-2xl font-bold text-destructive">{ai}%</div>
          </div>
        </div>

        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-medium",
          classification === "AI-Generated" ? "bg-destructive/10 text-destructive" :
          classification === "Human-Written" ? "bg-success/10 text-success" :
          "bg-warning/10 text-warning"
        )}>
          {classification}
        </div>

        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium text-foreground text-right">Human Content</div>
            <div className="text-2xl font-bold text-success text-right">{human}%</div>
          </div>
          <div className="p-2 rounded-lg bg-success/10">
            <User className="w-5 h-5 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
};
