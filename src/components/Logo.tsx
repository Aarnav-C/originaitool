import { Fingerprint } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
          <Fingerprint className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-foreground">Origin</span>
          <span className="text-gradient-primary">AI</span>
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          AI Detection
        </span>
      </div>
    </div>
  );
};
