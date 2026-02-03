import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Copy, Check, RefreshCw, Sparkles } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<"natural" | "casual" | "professional">("natural");

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    setIsHumanizing(true);
    setHumanizedText("");

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Text Humanizer</h2>
          <p className="text-sm text-muted-foreground">Transform AI-generated text to sound more natural</p>
        </div>
      </div>

      {/* Style Selector */}
      <div className="flex gap-2">
        {[
          { id: "natural", label: "Natural", icon: Sparkles },
          { id: "casual", label: "Casual", icon: Sparkles },
          { id: "professional", label: "Professional", icon: Sparkles },
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
          className="min-h-[150px] bg-card/50 border-border/50"
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
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-success">Humanized Output</label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHumanize}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {humanizedText}
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            ✨ This text has been rewritten to sound more human and natural
          </p>
        </div>
      )}
    </div>
  );
};
