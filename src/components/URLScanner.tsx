import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface URLScannerProps {
  onTextExtracted: (text: string) => void;
  isLoading?: boolean;
}

export const URLScanner = ({ onTextExtracted, isLoading }: URLScannerProps) => {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    if (!isValidUrl(cleanUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    setScanning(true);
    setScannedUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-url', {
        body: { url: cleanUrl }
      });

      if (error) {
        console.error('URL scan error:', error);
        toast.error("Failed to scan URL. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.text) {
        onTextExtracted(data.text);
        setScannedUrl(cleanUrl);
        setWordCount(data.text.split(/\s+/).length);
        toast.success(`Extracted ${data.text.split(/\s+/).length} words from webpage`);
      } else {
        toast.error("No readable text found on the page");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to scan URL. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !scanning && !isLoading) {
      handleScan();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Scan URL</h3>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/article"
            className="pl-10 bg-card/50 border-border/50"
            disabled={scanning || isLoading}
          />
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          onClick={handleScan}
          disabled={!url.trim() || scanning || isLoading}
          variant="outline"
          className="shrink-0"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Scan
            </>
          )}
        </Button>
      </div>

      {scannedUrl && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-success font-medium">Content extracted</p>
              <p className="text-xs text-muted-foreground truncate">{scannedUrl}</p>
              <p className="text-xs text-success mt-1">{wordCount} words ready for analysis</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Enter any article or webpage URL to extract and analyze its content
      </p>
    </div>
  );
};
