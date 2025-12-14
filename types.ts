export interface KeywordData {
  keyword: string;
  volume: number; // 0-100 scale for relative volume
  difficulty: number; // 0-100
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
  relevanceScore: number; // Simulated TF-IDF score
}

export interface ContentTopic {
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  projectedTraffic: string;
  contentType: 'Blog Post' | 'Landing Page' | 'Guide' | 'Case Study';
}

export interface AnalysisResult {
  domainAnalysis: {
    niche: string;
    targetAudience: string;
    competitorInsights: string;
  };
  keywords: KeywordData[];
  topics: ContentTopic[];
  strategicSummary: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
