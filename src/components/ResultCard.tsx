import { Bot, User, GitMerge, AlertCircle, CheckCircle2, Lightbulb, Cpu, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { HighlightedText } from "./HighlightedText";
import { WritingStyleCard } from "./WritingStyleCard";
import { ExportActions } from "./ExportActions";
import { ReadabilityCard } from "./ReadabilityCard";
import { AdvancedMetricsCard } from "./AdvancedMetricsCard";
import { HumanizationTipsCard } from "./HumanizationTipsCard";
import { AIHumanMeter } from "./AIHumanMeter";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { AnalysisResult } from "@/types/analysis";

interface ResultCardProps {
  result: AnalysisResult;
  originalText: string;
}

export const ResultCard = ({ result, originalText }: ResultCardProps) => {
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
    { label: "Stylistic Analysis", data: result.detailedBreakdown.stylistic },
    { label: "Semantic Patterns", data: result.detailedBreakdown.semantic },
    { label: "Statistical Signals", data: result.detailedBreakdown.statistical },
    { label: "Error Patterns", data: result.detailedBreakdown.errorPattern },
    { label: "Tone & Flow", data: result.detailedBreakdown.toneFlow },
    ...(result.detailedBreakdown.neuralPatterns ? [{ label: "Neural Patterns", data: result.detailedBreakdown.neuralPatterns }] : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Classification Card */}
      <div className={cn(
        "glass-card rounded-2xl p-6 border",
        config.borderColor
      )}>
        <div className="flex items-center gap-4 mb-6">
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
              AI Probability
            </div>
          </div>
        </div>

        {/* Confidence Badge */}
        {result.confidenceLevel && (
          <div className="mb-6 flex justify-center">
            <ConfidenceBadge level={result.confidenceLevel} probability={result.probability} />
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 rounded-full",
                result.classification === "Human-Written" ? "bg-gradient-to-r from-success to-success/80" :
                result.classification === "AI-Generated" ? "bg-gradient-to-r from-destructive to-destructive/80" :
                "bg-gradient-to-r from-warning to-warning/80"
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

        {/* Export Actions */}
        <div className="pt-4 border-t border-border/50">
          <ExportActions result={result} originalText={originalText} />
        </div>
      </div>

      {/* AI/Human Distribution Meter */}
      {(result.aiPercentage !== undefined || result.humanPercentage !== undefined) && (
        <AIHumanMeter
          aiPercentage={result.aiPercentage || result.probability}
          humanPercentage={result.humanPercentage || (100 - result.probability)}
          classification={result.classification}
        />
      )}

      {/* Sentence-by-Sentence Highlighting */}
      {result.sentenceAnalysis && result.sentenceAnalysis.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            Sentence-by-Sentence Forensics
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Hover over each sentence to see detection signals and reasoning.
          </p>
          <HighlightedText 
            sentences={result.sentenceAnalysis} 
            originalText={originalText}
          />
        </div>
      )}

      {/* Advanced Metrics */}
      {result.advancedMetrics && (
        <AdvancedMetricsCard metrics={result.advancedMetrics} />
      )}

      {/* Readability Analysis */}
      {result.readabilityMetrics && (
        <ReadabilityCard metrics={result.readabilityMetrics} />
      )}

      {/* Writing Style Analysis */}
      {result.writingStyle && (
        <WritingStyleCard style={result.writingStyle} />
      )}

      {/* Humanization Tips */}
      {result.humanizationTips && result.humanizationTips.length > 0 && (
        <HumanizationTipsCard tips={result.humanizationTips} />
      )}

      {/* Detailed Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          Detection Breakdown
        </h4>
        <div className="grid gap-4">
          {breakdownItems.map((item, index) => (
            <div
              key={item.label}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.data.weight && (
                    <span className="text-xs text-muted-foreground">
                      Weight: {(item.data.weight * 100).toFixed(0)}%
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{item.data.score}%</span>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-700 rounded-full", getScoreColor(item.data.score))}
                  style={{ width: `${item.data.score}%` }}
                />
              </div>
              {item.data.indicators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.data.indicators.slice(0, 4).map((indicator, i) => (
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
          {/* AI Signatures */}
          {result.evidenceSummary.aiSignatures && result.evidenceSummary.aiSignatures.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-destructive mb-2">AI Signatures Detected</h5>
              <div className="flex flex-wrap gap-2">
                {result.evidenceSummary.aiSignatures.map((sig, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Human Signatures */}
          {result.evidenceSummary.humanSignatures && result.evidenceSummary.humanSignatures.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-success mb-2">Human Signatures Detected</h5>
              <div className="flex flex-wrap gap-2">
                {result.evidenceSummary.humanSignatures.map((sig, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20">
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Burstiness Analysis</h5>
              <p className="text-sm text-foreground/80">{result.evidenceSummary.burstiessInsights}</p>
            </div>
          )}

          {result.evidenceSummary.anomalies && result.evidenceSummary.anomalies.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Anomalies</h5>
              <div className="flex flex-wrap gap-2">
                {result.evidenceSummary.anomalies.map((anomaly, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                    {anomaly}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Notes */}
      {result.technicalNotes && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Technical Notes
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed font-mono">
            {result.technicalNotes}
          </p>
        </div>
      )}

      {/* Confidence Explanation */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Analysis Summary
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.confidenceExplanation}
        </p>
      </div>
    </div>
  );
};
