export type KeyLLM =
  | 'ChatGPT'
  | 'Google SGE'
  | 'Gemini'
  | 'Perplexity'
  | 'Claude'
  | 'Grok'
  | 'Copilot'
  | 'Meta AI'
  | 'DeepSeek';

export interface LLMConfig {
  key: KeyLLM;
  name: string;
  provider: string;
  avatarColor: string;
  description: string;
}

export type KeyCountry =
  | 'PL'
  | 'UA'
  | 'SK'
  | 'CZ'
  | 'HU'
  | 'DE'
  | 'AT'
  | 'LT'
  | 'LV'
  | 'RO';

export interface CountryConfig {
  code: KeyCountry;
  name: string;
  language: string;
  localBrandName: string; // Cosibella local representation or equivalent
  flag: string;
  lat: number;
  lng: number;
}

export type QueryCategory = 'transactional' | 'conversational' | 'comparison' | 'recommendation';

export interface QueryPreset {
  id: string;
  text: string;
  category: QueryCategory;
  intentDescription: string;
}

export interface MetricSnapshot {
  globalScore: number; // 0-100 Global LLM Visibility Score (GLVS)
  countryScores: Record<KeyCountry, number>; // Country-Level Visibility Scores
  categoryScores: Record<QueryCategory, number>; // Category Authority Scores
  aiShareOfVoice: Record<string, number>; // Brand Name -> percentage
  rankingDistribution: {
    firstRecommend: number; // % in position #1
    top3: number; // % in position 2-3
    top10: number; // % in position 4-10
    notMentioned: number; // % not mentioned
  };
  sentimentRatio: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface QueryAuditRow {
  id: string;
  query: string;
  category: QueryCategory;
  country: KeyCountry;
  llm: KeyLLM;
  brandPresence: boolean;
  position: 'first' | 'top3' | 'top10' | 'none';
  shareOfVoice: number; // %
  sentiment: 'positive' | 'neutral' | 'negative';
  contextTags: string[];
  lastScanned: string;
  rankIndex: number; // numerical representation e.g. 1, 2, 5, 0 (none)
  competitors: string[];
  snippet: string; // raw AI response snippet
}

export interface PromptOptimizationStrategy {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  targetLLM: string;
  problemStatement: string;
  optimizedPromptTemplate: string;
  impactMetrics: string;
}

export interface GapAnalysisRow {
  query: string;
  country: KeyCountry;
  category: QueryCategory;
  competitorsVisible: string[];
  impactScore: number; // 1-10 priority score
  recommendingFactors: string[];
  actionPlan: string;
}
