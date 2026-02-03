import { Wand2, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HumanizationTip } from "@/types/analysis";

interface HumanizationTipsCardProps {
  tips: HumanizationTip[];
}

export const HumanizationTipsCard = ({ tips }: HumanizationTipsCardProps) => {
  if (!tips || tips.length === 0) return null;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30"
        };
      case "medium":
        return {
          icon: Info,
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30"
        };
      default:
        return {
          icon: CheckCircle2,
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30"
        };
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const sortedTips = [...tips].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-primary" />
        Humanization Tips
      </h4>
      <p className="text-sm text-muted-foreground mb-6">
        Suggestions to make AI-generated text appear more naturally human-written
      </p>

      <div className="space-y-3">
        {sortedTips.map((tip, index) => {
          const config = getPriorityConfig(tip.priority);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] animate-fade-in",
                config.bgColor,
                config.borderColor
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bgColor, config.color)}>
                      {getCategoryLabel(tip.category)}
                    </span>
                    <span className={cn("text-xs font-medium", config.color)}>
                      {tip.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{tip.tip}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
