
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
  zScore: number;
  viewsPerHour: number;
  performanceLabel: 'Outlier++' | 'Outlier+' | 'Standard' | 'Underperformer';
}

export interface ChannelProfile {
  name: string;
  subscriberCount: string;
  avgViews: number;
  medianViews: number;
  engagementRate: string;
  dominantSubNiche: string;
}

export interface MicroNiche {
  name: string;
  demandScore: number; // 0-100
  competitionScore: number; // 0-100
  monetizationClass: 'High' | 'Medium' | 'Low';
  saturationLevel: 'Low' | 'Medium' | 'High';
  successProbability: number;
  barrierToEntry: 'Low' | 'Medium' | 'High';
  keywords: string[];
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

export interface RoadmapItem {
  title: string;
  hook: string;
  structure: string;
  ctaStrategy: string;
}

export interface ChannelAudit {
  strengths: string[];
  weaknesses: string[];
  expansionOpportunities: string[];
}

export interface AnalysisResult {
  summary: string;
  channelProfile: ChannelProfile;
  videos: Video[];
  microNiches: MicroNiche[];
  competitors: Competitor[];
  shadowAnalysis: ShadowVideo[];
  contentRoadmap: RoadmapItem[];
  beginnerOpportunityScore: number; // 0-100
  successProbability: number; // 0-100
  channelAudit?: ChannelAudit;
  globalMonetization: {
    topRegions: string[];
    avgRPM: string;
  };
}

export type LoadingState = 'idle' | 'analyzing' | 'success' | 'error';
