import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { TextInput } from "@/components/TextInput";
import { ResultCard } from "@/components/ResultCard";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { DocumentUpload } from "@/components/DocumentUpload";
import { URLScanner } from "@/components/URLScanner";
import { TextHumanizer } from "@/components/TextHumanizer";
import { ComparisonMode } from "@/components/ComparisonMode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, Zap, Brain, Eye, History, BarChart3, FileText, Sparkles, Activity, Wand2,
  Upload, Globe, GitCompare, Scan
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult, HistoryItem } from "@/types/analysis";

const features = [
  { icon: Brain, title: "Deep Analysis", description: "Multi-layer detection" },
  { icon: Activity, title: "8D Forensics", description: "8 detection dimensions" },
  { icon: Shield, title: "High Accuracy", description: "Precision classification" },
  { icon: Eye, title: "Sentence-Level", description: "Word-by-word detection" },
  { icon: Upload, title: "Document Scan", description: "Upload PDF, DOCX, TXT" },
  { icon: Globe, title: "URL Scanner", description: "Analyze any webpage" },
  { icon: Wand2, title: "Humanizer", description: "Make AI text natural" },
  { icon: GitCompare, title: "Compare Mode", description: "Side-by-side analysis" },
];

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("analyze");
  const [inputMode, setInputMode] = useState<"text" | "upload" | "url">("text");

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("originai-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("originai-history", JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error("Failed to analyze text. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      
      // Add to history
      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        text,
        classification: data.classification,
        probability: data.probability,
        timestamp: new Date(),
        result: data
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setText(item.text);
    setResult(item.result);
    setActiveTab("analyze");
    toast.info("Loaded analysis from history");
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success("Removed from history");
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success("History cleared");
  };

  const handleTextExtracted = (extractedText: string) => {
    setText(extractedText);
    setResult(null);
    toast.success("Text ready for analysis!");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>AI Detection Active</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Advanced AI Content Detection Suite
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">The Ultimate </span>
            <span className="text-gradient-primary">AI Detection</span>
            <span className="text-foreground"> Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Detect AI content, humanize text, scan documents & URLs, compare texts side-by-side. 
            The most comprehensive AI detection suite available.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-3 text-center animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <feature.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <h3 className="text-xs font-medium text-foreground">{feature.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8 h-auto p-1">
              <TabsTrigger value="analyze" className="gap-1.5 text-xs py-2.5">
                <Scan className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analyze</span>
              </TabsTrigger>
              <TabsTrigger value="humanize" className="gap-1.5 text-xs py-2.5">
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Humanize</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-1.5 text-xs py-2.5">
                <GitCompare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 text-xs py-2.5">
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="hidden sm:inline text-[10px] bg-primary/20 px-1.5 rounded-full">
                    {history.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-1.5 text-xs py-2.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
            </TabsList>

            {/* Analyze Tab */}
            <TabsContent value="analyze">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                  {/* Input Mode Selector */}
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setInputMode("text")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                          inputMode === "text"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Text
                      </button>
                      <button
                        onClick={() => setInputMode("upload")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                          inputMode === "upload"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <button
                        onClick={() => setInputMode("url")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                          inputMode === "url"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        URL
                      </button>
                    </div>

                    {inputMode === "upload" && (
                      <DocumentUpload 
                        onTextExtracted={handleTextExtracted}
                        isLoading={isLoading}
                      />
                    )}

                    {inputMode === "url" && (
                      <URLScanner 
                        onTextExtracted={handleTextExtracted}
                        isLoading={isLoading}
                      />
                    )}
                  </div>

                  {/* Main Text Input */}
                  <div className="glass-card rounded-2xl p-6">
                    <TextInput
                      text={text}
                      setText={setText}
                      onAnalyze={handleAnalyze}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                        <Brain className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Analyzing Content...
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Running 8-dimensional forensic analysis. This typically takes 5-15 seconds.
                      </p>
                    </div>
                  ) : result ? (
                    <ResultCard result={result} originalText={text} />
                  ) : (
                    <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                        <Eye className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Ready to Analyze
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Paste text, upload a document, or scan a URL to detect AI-generated content.
                        <span className="block mt-2 text-primary">
                          Try all our new features: Humanizer, Compare Mode & more!
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Humanize Tab */}
            <TabsContent value="humanize">
              <div className="max-w-3xl mx-auto">
                <div className="glass-card rounded-2xl p-6">
                  <TextHumanizer initialText={result?.classification === "AI-Generated" ? text : ""} />
                </div>
              </div>
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare">
              <div className="max-w-4xl mx-auto">
                <div className="glass-card rounded-2xl p-6">
                  <ComparisonMode />
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="max-w-2xl mx-auto">
                <AnalysisHistory
                  history={history}
                  onSelect={handleSelectHistory}
                  onDelete={handleDeleteHistory}
                  onClear={handleClearHistory}
                />
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <div className="max-w-3xl mx-auto">
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">About OriginAI</h2>
                    <p className="text-muted-foreground">
                      The most comprehensive AI content detection and analysis platform
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/30">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        8D Forensic Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Our analysis examines 8 dimensions: stylistic patterns, semantic coherence, 
                        statistical signals, error patterns, tone flow, neural patterns, 
                        perplexity scores, and burstiness metrics.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-primary" />
                        AI Humanizer
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Transform AI-generated text into natural, human-sounding writing. 
                        Choose from natural, casual, or professional styles.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Document Scanning
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upload PDF, DOCX, or TXT files directly. Our system extracts 
                        text content and runs full analysis on your documents.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        URL Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analyze any webpage by simply entering its URL. Perfect for 
                        checking articles, blog posts, or online content.
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Built with advanced AI technology for accurate content detection.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            <span className="text-foreground font-semibold">OriginAI</span> — The Ultimate AI Content Detection Suite
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
