import { BookOpen, GraduationCap, Gauge, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadabilityMetrics } from "@/types/analysis";

interface ReadabilityCardProps {
  metrics: ReadabilityMetrics;
}

export const ReadabilityCard = ({ metrics }: ReadabilityCardProps) => {
  const getReadabilityColor = (level: string) => {
    switch (level) {
      case "very_easy": return "text-success";
      case "easy": return "text-success";
      case "moderate": return "text-warning";
      case "difficult": return "text-destructive";
      case "very_difficult": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getEaseColor = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const formatLevel = (level: string) => {
    return level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const items = [
    {
      icon: GraduationCap,
      label: "Grade Level",
      value: metrics.fleschKincaidGrade?.toFixed(1) || "N/A",
      sublabel: "Flesch-Kincaid"
    },
    {
      icon: BookOpen,
      label: "Reading Ease",
      value: metrics.fleschReadingEase?.toFixed(0) || "N/A",
      sublabel: "0-100 scale"
    },
    {
      icon: Gauge,
      label: "Fog Index",
      value: metrics.gunningFogIndex?.toFixed(1) || "N/A",
      sublabel: "Gunning Fog"
    },
    {
      icon: Type,
      label: "Avg Words/Sentence",
      value: metrics.avgWordsPerSentence?.toFixed(1) || "N/A",
      sublabel: "Sentence length"
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Readability Analysis
      </h4>

      {/* Overall Readability Level */}
      <div className="mb-6 p-4 rounded-xl bg-secondary/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Readability Level</span>
          <span className={cn("text-lg font-bold", getReadabilityColor(metrics.readabilityLevel))}>
            {formatLevel(metrics.readabilityLevel)}
          </span>
        </div>
        <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-700 rounded-full", getEaseColor(metrics.fleschReadingEase || 50))}
            style={{ width: `${metrics.fleschReadingEase || 50}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="p-4 rounded-xl bg-secondary/30 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{item.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
