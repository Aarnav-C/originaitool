import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Copy, Check, RefreshCw, Sparkles, Scan, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextHumanizerProps {
  initialText?: string;
}

export const TextHumanizer = ({ initialText = "" }: TextHumanizerProps) => {
  const [inputText, setInputText] = useState(initialText);
  const [humanizedText, setHumanizedText] = useState("");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{before: number, after: number} | null>(null);
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<"natural" | "casual" | "professional">("natural");

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    setIsHumanizing(true);
    setHumanizedText("");
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('humanize-text', {
        body: { text: inputText, style }
      });

      if (error) {
        console.error('Humanization error:', error);
        toast.error("Failed to humanize text. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.humanizedText) {
        setHumanizedText(data.humanizedText);
        toast.success("Text humanized successfully!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to humanize text. Please try again.");
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleVerify = async () => {
    if (!humanizedText) return;
    
    setIsVerifying(true);
    
    try {
      const [beforeResult, afterResult] = await Promise.all([
        supabase.functions.invoke('analyze-text', { body: { text: inputText } }),
        supabase.functions.invoke('analyze-text', { body: { text: humanizedText } }),
      ]);

      if (beforeResult.data && afterResult.data) {
        setVerificationResult({
          before: beforeResult.data.probability,
          after: afterResult.data.probability
        });
        toast.success("Verification complete!");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSampleAIText = () => {
    setInputText("Artificial intelligence has revolutionized numerous industries, offering unprecedented opportunities for automation and efficiency. The integration of machine learning algorithms has enabled organizations to process vast amounts of data with remarkable accuracy. Furthermore, natural language processing has transformed how we interact with technology, making interfaces more intuitive and accessible.");
    setHumanizedText("");
    setVerificationResult(null);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Text Humanizer</h2>
            <p className="text-sm text-muted-foreground">Transform AI text to sound natural</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadSampleAIText}>
          Load Sample
        </Button>
      </div>

      {/* Style Selector */}
      <div className="flex gap-2">
        {[
          { id: "natural", label: "Natural" },
          { id: "casual", label: "Casual" },
          { id: "professional", label: "Professional" },
        ].map((option) => (
          <Button
            key={option.id}
            variant={style === option.id ? "default" : "outline"}
            size="sm"
            onClick={() => setStyle(option.id as typeof style)}
            className={cn(
              "flex-1",
              style === option.id && "bg-primary text-primary-foreground"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">AI-Generated Text</label>
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
        </div>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your AI-generated text here..."
          className="min-h-[120px] bg-card/50 border-border/50"
        />
      </div>

      {/* Humanize Button */}
      <Button
        onClick={handleHumanize}
        disabled={!inputText.trim() || isHumanizing}
        className="w-full"
        variant="hero"
        size="lg"
      >
        {isHumanizing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Humanizing...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Humanize Text
          </>
        )}
      </Button>

      {/* Output */}
      {humanizedText && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-success">Humanized Output</label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleHumanize} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {humanizedText}
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying}
            variant="outline"
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Verify Humanization (Compare AI Scores)
              </>
            )}
          </Button>

          {/* Verification Result */}
          {verificationResult && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-medium text-foreground mb-3 text-center">AI Detection Comparison</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{verificationResult.before}%</p>
                  <p className="text-xs text-muted-foreground">Before</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{verificationResult.after}%</p>
                  <p className="text-xs text-muted-foreground">After</p>
                </div>
                <div className="text-center ml-4 px-4 py-2 rounded-lg bg-success/10">
                  <p className="text-lg font-bold text-success">
                    -{verificationResult.before - verificationResult.after}%
                  </p>
                  <p className="text-xs text-muted-foreground">Reduced</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
