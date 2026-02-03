import { Pen, BookOpen, MessageSquare, Sparkles, Volume2, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingStyle {
  formality: "formal" | "informal" | "mixed";
  tone: string;
  complexity: "simple" | "moderate" | "complex";
  vocabulary: "basic" | "intermediate" | "advanced";
  voice?: "active" | "passive" | "mixed";
  perspective?: "first_person" | "second_person" | "third_person" | "mixed";
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

  const formatPerspective = (perspective: string) => {
    return perspective.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const items = [
    {
      icon: BookOpen,
      label: "Formality",
      value: style.formality,
      colorClass: "bg-secondary text-secondary-foreground"
    },
    {
      icon: MessageSquare,
      label: "Tone",
      value: style.tone,
      colorClass: "bg-secondary text-secondary-foreground"
    },
    {
      icon: Sparkles,
      label: "Complexity",
      value: style.complexity,
      colorClass: getComplexityColor(style.complexity)
    },
    {
      icon: BookOpen,
      label: "Vocabulary",
      value: style.vocabulary,
      colorClass: getVocabColor(style.vocabulary)
    }
  ];

  if (style.voice) {
    items.push({
      icon: Volume2,
      label: "Voice",
      value: style.voice,
      colorClass: "bg-secondary text-secondary-foreground"
    });
  }

  if (style.perspective) {
    items.push({
      icon: User2,
      label: "Perspective",
      value: formatPerspective(style.perspective),
      colorClass: "bg-secondary text-secondary-foreground"
    });
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Pen className="w-5 h-5 text-primary" />
        Writing Style Analysis
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div 
            key={item.label} 
            className="space-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
            <span className={cn(
              "inline-block px-3 py-1.5 rounded-full text-sm capitalize",
              item.colorClass
            )}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
