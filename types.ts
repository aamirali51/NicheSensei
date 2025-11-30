export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploadDate: string;
  views: number;
  likes: number;
  comments: number;
  duration: string; // e.g., "10:05"
  type: 'Long' | 'Short';
  outlierScore?: number; // Calculated on frontend or by AI
  growthVelocity?: 'High' | 'Medium' | 'Low';
}

export interface ChannelProfile {
  name: string;
  subscriberCount: string;
  avgViews: number;
  medianViews: number;
  engagementRate: string;
  dominantSubNiche: string;
}

export interface Competitor {
  name: string;
  subscribers: string;
  similarityScore: number; // 0-100
  notes: string;
}

export interface ShadowVideo {
  originalVideoId: string;
  copycatChannel: string;
  copycatTitle: string;
  performanceStatus: 'Better' | 'Worse' | 'Similar';
  similarityReason: string;
}

export interface SubNicheOpportunity {
  name: string;
  competitionLevel: 'Low' | 'Medium' | 'High';
  demandLevel: 'Low' | 'Medium' | 'High';
  rpmEstimate: string;
  successProbability: number; // 0-100
  recommendedTopics: string[];
}

export interface ContentStrategy {
  title: string;
  format: string; // e.g., "Top 10 List", "Documentary"
  facelessTechnique: string; // e.g., "Stock footage + AI Voice"
  hook: string;
}

export interface AnalysisResult {
  channelProfile: ChannelProfile;
  videos: Video[];
  competitors: Competitor[];
  shadowAnalysis: ShadowVideo[];
  subNiches: SubNicheOpportunity[];
  contentStrategy: ContentStrategy[];
  globalMonetization: {
    topRegions: string[];
    avgRPM: string;
  };
}

export type LoadingState = 'idle' | 'analyzing' | 'success' | 'error';
