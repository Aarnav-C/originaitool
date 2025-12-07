import { Download, Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ExportActionsProps {
  result: any;
  originalText: string;
}

export const ExportActions = ({ result, originalText }: ExportActionsProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const summary = `OriginAI Analysis Report
========================
Classification: ${result.classification}
Confidence: ${result.probability}%

Summary:
${result.confidenceExplanation}

Detailed Breakdown:
- Stylistic: ${result.detailedBreakdown.stylistic.score}%
- Semantic: ${result.detailedBreakdown.semantic.score}%
- Statistical: ${result.detailedBreakdown.statistical.score}%
- Error Patterns: ${result.detailedBreakdown.errorPattern.score}%
- Tone & Flow: ${result.detailedBreakdown.toneFlow.score}%

Analyzed Text:
"${originalText.substring(0, 200)}${originalText.length > 200 ? '...' : ''}"
`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Analysis copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJSON = () => {
    const data = {
      ...result,
      originalText,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `originai-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analysis exported as JSON!");
  };

  const shareResult = async () => {
    const shareText = `I analyzed some text with OriginAI and it's ${result.probability}% likely to be ${result.classification.toLowerCase()}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "OriginAI Analysis",
          text: shareText,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        toast.success("Share text copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportJSON}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareResult}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
};
