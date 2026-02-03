import { Shield, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  level: "very_high" | "high" | "moderate" | "low" | "very_low";
  probability: number;
}

export const ConfidenceBadge = ({ level, probability }: ConfidenceBadgeProps) => {
  const getConfig = () => {
    switch (level) {
      case "very_high":
        return {
          icon: ShieldCheck,
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
          label: "Very High Confidence",
          description: "Highly reliable detection"
        };
      case "high":
        return {
          icon: ShieldCheck,
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
          label: "High Confidence",
          description: "Strong detection signals"
        };
      case "moderate":
        return {
          icon: Shield,
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
          label: "Moderate Confidence",
          description: "Mixed signals detected"
        };
      case "low":
        return {
          icon: ShieldAlert,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          label: "Low Confidence",
          description: "Uncertain result"
        };
      case "very_low":
        return {
          icon: ShieldQuestion,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          label: "Very Low Confidence",
          description: "Result unreliable"
        };
      default:
        return {
          icon: Shield,
          color: "text-muted-foreground",
          bgColor: "bg-secondary",
          borderColor: "border-border",
          label: "Unknown",
          description: "Confidence not available"
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-4 py-2 rounded-xl border",
      config.bgColor,
      config.borderColor
    )}>
      <Icon className={cn("w-5 h-5", config.color)} />
      <div>
        <div className={cn("text-sm font-semibold", config.color)}>{config.label}</div>
        <div className="text-xs text-muted-foreground">{config.description}</div>
      </div>
      <div className={cn("text-2xl font-bold ml-2", config.color)}>
        {probability}%
      </div>
    </div>
  );
};
