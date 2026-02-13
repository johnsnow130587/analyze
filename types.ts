
export interface CompetitorInfo {
  website: string;
  estimatedTraffic: string;
  niche: string;
  topKeywords: string[];
}

export interface TopKeyword {
    keyword: string;
    traffic: string; 
}

export interface AnalysisResult {
  // Core Identity
  website: string;
  niche: string;
  country: string;

  // Core Popularity & Volume Metrics
  monthlyVisits: string;
  uniqueVisitors: string;
  pageViews: string;
  globalRank: number;
  countryRank: number;

  // Engagement & User Experience
  bounceRate: string;
  avgVisitDuration: string;

  // Traffic Source & Acquisition
  trafficChannelBreakdown: Record<string, number>; // e.g., { "Direct": 50, "Search": 30 }
  topReferrers: string[];

  // SEO & Authority
  domainAuthority: number;
  referringDomains: string;
  organicKeywords: string;
  topKeywordsByTraffic: TopKeyword[];

  // Audience Demographics
  geographicDistribution: Record<string, number>;
  deviceSplit: Record<string, number>; // { "Desktop": 70, "Mobile": 30 }

  // Actionable Insights
  improvementSuggestions: string[];
  keyCompetitors: CompetitorInfo[];
}
