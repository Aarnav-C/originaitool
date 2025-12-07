import { Scan } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
          <Scan className="w-5 h-5 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse-glow" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-foreground">Origin</span>
          <span className="text-gradient-primary">AI</span>
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Content Detector
        </span>
      </div>
    </div>
  );
};
