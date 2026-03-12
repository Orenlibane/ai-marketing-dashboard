export interface MarketingTool {
  id: number;
  name: string;
  description: string;
  category: string;
  sourceUrl: string;
  dateAdded: string;
  isNewLaunch: boolean;
  usageScore: number;
  reviewSentiment: 'positive' | 'neutral' | 'negative';
  lastUpdated: string;
}

export interface ToolStats {
  totalTools: number;
  newLaunches: number;
  avgScore: number;
  categoryCount: number;
}

export interface FetchToolsResponse {
  success: boolean;
  message: string;
  tools: MarketingTool[];
}
