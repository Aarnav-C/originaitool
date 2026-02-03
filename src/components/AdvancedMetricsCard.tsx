import { Activity, Sparkles, BookText, BarChart3, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdvancedMetrics } from "@/types/analysis";

interface AdvancedMetricsCardProps {
  metrics: AdvancedMetrics;
}

export const AdvancedMetricsCard = ({ metrics }: AdvancedMetricsCardProps) => {
  const getScoreColor = (score: number, inverse = false) => {
    const adjusted = inverse ? 100 - score : score;
    if (adjusted >= 70) return "bg-destructive";
    if (adjusted >= 40) return "bg-warning";
    return "bg-success";
  };

  const getScoreLabel = (score: number, type: string) => {
    if (type === "perplexity") {
      if (score >= 70) return { label: "Low (AI-like)", color: "text-destructive" };
      if (score >= 40) return { label: "Moderate", color: "text-warning" };
      return { label: "High (Human-like)", color: "text-success" };
    }
    if (type === "burstiness") {
      if (score >= 70) return { label: "High (Human-like)", color: "text-success" };
      if (score >= 40) return { label: "Moderate", color: "text-warning" };
      return { label: "Low (AI-like)", color: "text-destructive" };
    }
    if (type === "vocabulary") {
      if (score >= 70) return { label: "Rich", color: "text-success" };
      if (score >= 40) return { label: "Moderate", color: "text-warning" };
      return { label: "Limited", color: "text-destructive" };
    }
    return { label: "N/A", color: "text-muted-foreground" };
  };

  const items = [
    {
      icon: Activity,
      label: "Perplexity Score",
      value: metrics.perplexityScore || 0,
      type: "perplexity",
      description: "Lower scores suggest AI generation",
      inverse: true
    },
    {
      icon: Sparkles,
      label: "Burstiness Score",
      value: metrics.burstinessScore || 0,
      type: "burstiness",
      description: "Higher variance suggests human writing",
      inverse: false
    },
    {
      icon: BookText,
      label: "Vocabulary Richness",
      value: metrics.vocabularyRichness || 0,
      type: "vocabulary",
      description: "Type-token ratio analysis",
      inverse: false
    },
    {
      icon: BarChart3,
      label: "Sentence Variance",
      value: metrics.sentenceLengthVariance || 0,
      type: "burstiness",
      description: "Standard deviation of sentence lengths",
      inverse: false
    },
    {
      icon: Fingerprint,
      label: "Unique Word Ratio",
      value: (metrics.uniqueWordRatio || 0) * 100,
      type: "vocabulary",
      description: "Percentage of unique words",
      inverse: false
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Advanced Detection Metrics
      </h4>
      <p className="text-sm text-muted-foreground mb-6">
        Statistical analysis of text patterns used for AI detection
      </p>

      <div className="space-y-5">
        {items.map((item, index) => {
          const scoreInfo = getScoreLabel(item.value, item.type);
          return (
            <div
              key={item.label}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium", scoreInfo.color)}>
                    {scoreInfo.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{item.value.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-700 rounded-full", getScoreColor(item.value, item.inverse))}
                  style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
