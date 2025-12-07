import { Bot, User, GitMerge, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  classification: "AI-Generated" | "Human-Written" | "Hybrid";
  probability: number;
  evidenceSummary: {
    linguisticMarkers: string[];
    structuralPatterns: string[];
    burstiessInsights: string;
    anomalies: string[];
  };
  detailedBreakdown: {
    stylistic: { score: number; indicators: string[] };
    semantic: { score: number; indicators: string[] };
    statistical: { score: number; indicators: string[] };
    errorPattern: { score: number; indicators: string[] };
    toneFlow: { score: number; indicators: string[] };
  };
  confidenceExplanation: string;
}

interface ResultCardProps {
  result: AnalysisResult;
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const getClassificationConfig = () => {
    switch (result.classification) {
      case "AI-Generated":
        return {
          icon: Bot,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          label: "AI Generated",
          description: "This content appears to be written by an AI system",
        };
      case "Human-Written":
        return {
          icon: User,
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
          label: "Human Written",
          description: "This content appears to be written by a human",
        };
      case "Hybrid":
        return {
          icon: GitMerge,
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
          label: "Hybrid Content",
          description: "This content appears to be a mix of human and AI writing",
        };
    }
  };

  const config = getClassificationConfig();
  const Icon = config.icon;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-destructive";
    if (score >= 40) return "bg-warning";
    return "bg-success";
  };

  const breakdownItems = [
    { label: "Stylistic", data: result.detailedBreakdown.stylistic },
    { label: "Semantic", data: result.detailedBreakdown.semantic },
    { label: "Statistical", data: result.detailedBreakdown.statistical },
    { label: "Error Patterns", data: result.detailedBreakdown.errorPattern },
    { label: "Tone & Flow", data: result.detailedBreakdown.toneFlow },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Classification */}
      <div className={cn(
        "glass-card rounded-2xl p-6 border",
        config.borderColor
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center",
            config.bgColor
          )}>
            <Icon className={cn("w-8 h-8", config.color)} />
          </div>
          <div className="flex-1">
            <h3 className={cn("text-2xl font-bold", config.color)}>
              {config.label}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {config.description}
            </p>
          </div>
          <div className="text-right">
            <div className={cn("text-4xl font-bold", config.color)}>
              {result.probability}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Confidence
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 rounded-full",
                result.classification === "Human-Written" ? "bg-success" :
                result.classification === "AI-Generated" ? "bg-destructive" :
                "bg-warning"
              )}
              style={{ width: `${result.probability}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Human</span>
            <span>Hybrid</span>
            <span>AI</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Detailed Analysis
        </h4>
        <div className="grid gap-4">
          {breakdownItems.map((item, index) => (
            <div
              key={item.label}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.data.score}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-700 rounded-full", getScoreColor(item.data.score))}
                  style={{ width: `${item.data.score}%` }}
                />
              </div>
              {item.data.indicators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.data.indicators.slice(0, 3).map((indicator, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Summary */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Evidence Summary
        </h4>
        
        <div className="space-y-4">
          {result.evidenceSummary.linguisticMarkers.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Linguistic Markers</h5>
              <div className="flex flex-wrap gap-2">
                {result.evidenceSummary.linguisticMarkers.map((marker, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.evidenceSummary.structuralPatterns.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Structural Patterns</h5>
              <div className="flex flex-wrap gap-2">
                {result.evidenceSummary.structuralPatterns.map((pattern, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.evidenceSummary.burstiessInsights && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Burstiness Insights</h5>
              <p className="text-sm text-foreground/80">{result.evidenceSummary.burstiessInsights}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confidence Explanation */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-primary" />
          Confidence Explanation
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.confidenceExplanation}
        </p>
      </div>
    </div>
  );
};
