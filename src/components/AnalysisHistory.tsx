import { Bot, User, GitMerge, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { HistoryItem } from "@/types/analysis";

interface AnalysisHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const AnalysisHistory = ({ history, onSelect, onDelete, onClear }: AnalysisHistoryProps) => {
  const getIcon = (classification: string) => {
    switch (classification) {
      case "AI-Generated":
        return { icon: Bot, color: "text-destructive" };
      case "Human-Written":
        return { icon: User, color: "text-success" };
      default:
        return { icon: GitMerge, color: "text-warning" };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No analysis history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Recent Analyses ({history.length})
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Clear All
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {history.map((item) => {
          const { icon: Icon, color } = getIcon(item.classification);
          
          return (
            <div
              key={item.id}
              className="glass-card rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors group"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-md bg-secondary", color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    {item.text.substring(0, 60)}...
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs font-medium", color)}>
                      {item.probability}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
