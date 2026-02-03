import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GitCompare, Loader2, ArrowRight, Bot, User, GitMerge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

interface ComparisonResult {
  text1: AnalysisResult;
  text2: AnalysisResult;
}

export const ComparisonMode = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    if (!text1.trim() || !text2.trim()) {
      toast.error("Please enter text in both fields");
      return;
    }

    setIsComparing(true);
    setResults(null);

    try {
      // Analyze both texts in parallel
      const [result1, result2] = await Promise.all([
        supabase.functions.invoke('analyze-text', { body: { text: text1 } }),
        supabase.functions.invoke('analyze-text', { body: { text: text2 } }),
      ]);

      if (result1.error || result2.error) {
        toast.error("Failed to analyze texts. Please try again.");
        return;
      }

      if (result1.data.error || result2.data.error) {
        toast.error(result1.data.error || result2.data.error);
        return;
      }

      setResults({
        text1: result1.data,
        text2: result2.data,
      });
      toast.success("Comparison complete!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to compare texts. Please try again.");
    } finally {
      setIsComparing(false);
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case "AI-Generated": return Bot;
      case "Human-Written": return User;
      default: return GitMerge;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "AI-Generated": return "text-destructive";
      case "Human-Written": return "text-success";
      default: return "text-warning";
    }
  };

  const ResultCard = ({ result, label }: { result: AnalysisResult; label: string }) => {
    const Icon = getClassificationIcon(result.classification);
    const colorClass = getClassificationColor(result.classification);

    return (
      <div className="glass-card rounded-xl p-4 flex-1">
        <p className="text-xs text-muted-foreground mb-3">{label}</p>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            result.classification === "AI-Generated" ? "bg-destructive/10" :
            result.classification === "Human-Written" ? "bg-success/10" : "bg-warning/10"
          )}>
            <Icon className={cn("w-6 h-6", colorClass)} />
          </div>
          <div>
            <p className={cn("text-lg font-bold", colorClass)}>
              {result.classification}
            </p>
            <p className="text-2xl font-bold text-foreground">{result.probability}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">AI Probability</span>
            <span className="font-medium">{result.aiPercentage || result.probability}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-700 rounded-full",
                result.classification === "Human-Written" ? "bg-success" :
                result.classification === "AI-Generated" ? "bg-destructive" : "bg-warning"
              )}
              style={{ width: `${result.probability}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Confidence: {result.confidenceLevel || "moderate"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Compare Texts</h2>
          <p className="text-sm text-muted-foreground">Analyze two texts side by side</p>
        </div>
      </div>

      {/* Input Areas */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text 1</label>
          <Textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Paste first text here..."
            className="min-h-[150px] bg-card/50 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            {text1.trim() ? text1.trim().split(/\s+/).length : 0} words
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text 2</label>
          <Textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Paste second text here..."
            className="min-h-[150px] bg-card/50 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            {text2.trim() ? text2.trim().split(/\s+/).length : 0} words
          </p>
        </div>
      </div>

      {/* Compare Button */}
      <Button
        onClick={handleCompare}
        disabled={!text1.trim() || !text2.trim() || isComparing}
        className="w-full"
        variant="hero"
        size="lg"
      >
        {isComparing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Comparing...
          </>
        ) : (
          <>
            <GitCompare className="w-5 h-5" />
            Compare Texts
          </>
        )}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground text-center">Comparison Results</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ResultCard result={results.text1} label="Text 1 Analysis" />
            <ResultCard result={results.text2} label="Text 2 Analysis" />
          </div>
          
          {/* Difference Summary */}
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Quick Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.abs(results.text1.probability - results.text2.probability)}%
                </p>
                <p className="text-xs text-muted-foreground">Probability Difference</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {results.text1.classification === results.text2.classification ? "Same" : "Different"}
                </p>
                <p className="text-xs text-muted-foreground">Classification Match</p>
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  results.text1.probability > results.text2.probability ? "text-destructive" : "text-success"
                )}>
                  Text {results.text1.probability > results.text2.probability ? "1" : "2"}
                </p>
                <p className="text-xs text-muted-foreground">More AI-like</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
