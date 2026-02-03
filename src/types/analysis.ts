export interface SentenceAnalysis {
  text: string;
  classification: "ai" | "human" | "uncertain";
  confidence: number;
  reason: string;
  signals?: string[];
}

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFogIndex: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  readabilityLevel: "very_easy" | "easy" | "moderate" | "difficult" | "very_difficult";
}

export interface AdvancedMetrics {
  perplexityScore: number;
  burstinessScore: number;
  vocabularyRichness: number;
  sentenceLengthVariance: number;
  uniqueWordRatio: number;
}

export interface HumanizationTip {
  category: "vocabulary" | "structure" | "tone" | "style" | "errors";
  tip: string;
  priority: "high" | "medium" | "low";
}

export interface BreakdownItem {
  score: number;
  indicators: string[];
  weight?: number;
}

export interface AnalysisResult {
  classification: "AI-Generated" | "Human-Written" | "Hybrid";
  probability: number;
  aiPercentage?: number;
  humanPercentage?: number;
  confidenceLevel?: "very_high" | "high" | "moderate" | "low" | "very_low";
  sentenceAnalysis?: SentenceAnalysis[];
  readabilityMetrics?: ReadabilityMetrics;
  advancedMetrics?: AdvancedMetrics;
  evidenceSummary: {
    linguisticMarkers: string[];
    structuralPatterns: string[];
    burstiessInsights: string;
    anomalies: string[];
    aiSignatures?: string[];
    humanSignatures?: string[];
  };
  detailedBreakdown: {
    stylistic: BreakdownItem;
    semantic: BreakdownItem;
    statistical: BreakdownItem;
    errorPattern: BreakdownItem;
    toneFlow: BreakdownItem;
    neuralPatterns?: BreakdownItem;
  };
  writingStyle?: {
    formality: "formal" | "informal" | "mixed";
    tone: string;
    complexity: "simple" | "moderate" | "complex";
    vocabulary: "basic" | "intermediate" | "advanced";
    voice?: "active" | "passive" | "mixed";
    perspective?: "first_person" | "second_person" | "third_person" | "mixed";
  };
  humanizationTips?: HumanizationTip[];
  suggestions?: string[];
  confidenceExplanation: string;
  technicalNotes?: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  classification: "AI-Generated" | "Human-Written" | "Hybrid";
  probability: number;
  timestamp: Date;
  result: AnalysisResult;
}
