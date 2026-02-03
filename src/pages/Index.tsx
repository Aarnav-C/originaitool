import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { TextInput } from "@/components/TextInput";
import { ResultCard } from "@/components/ResultCard";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Zap, Brain, Eye, History, BarChart3, FileText, Sparkles, Activity, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult, HistoryItem } from "@/types/analysis";

const features = [
  {
    icon: Brain,
    title: "Deep Analysis",
    description: "Multi-layer detection algorithms"
  },
  {
    icon: Activity,
    title: "8D Forensics",
    description: "8 detection dimensions analyzed"
  },
  {
    icon: Shield,
    title: "High Accuracy",
    description: "Precision content classification"
  },
  {
    icon: Eye,
    title: "Sentence-Level",
    description: "Word-by-word AI detection"
  },
  {
    icon: BarChart3,
    title: "Advanced Metrics",
    description: "Perplexity & burstiness scores"
  },
  {
    icon: FileText,
    title: "Readability",
    description: "Flesch-Kincaid & Fog Index"
  },
  {
    icon: Wand2,
    title: "Humanization",
    description: "Make AI text more natural"
  },
  {
    icon: Sparkles,
    title: "Style Analysis",
    description: "Tone, voice & complexity"
  }
];

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("analyze");

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
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20
      
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
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Advanced AI Content Detection
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">Detect </span>
            <span className="text-gradient-primary">AI-Generated</span>
            <span className="text-foreground"> Content</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced forensic analysis to determine if text was written by a human, 
            AI, or a combination of both. Get sentence-level insights, readability metrics, 
            and actionable recommendations.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-4 text-center animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-medium text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="analyze" className="gap-2">
                <Brain className="w-4 h-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="glass-card rounded-2xl p-6">
                  <TextInput
                    text={text}
                    setText={setText}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                  />
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  {result ? (
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
                        Paste your text on the left and click "Analyze Text" to detect 
                        whether it was written by a human or AI. 
                        <span className="block mt-2 text-primary">
                          Hover over results to see which sentences are AI-generated!
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

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
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            <span className="text-foreground font-semibold">OriginAI</span> — Advanced AI Content Detection
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
