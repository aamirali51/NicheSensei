

export interface ThumbnailStrategy {
  visualHook: string;
  colorPsychology: string;
  textAnalysis: string;
  improvementSuggestion: string;
}

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
  thumbnailStrategy?: ThumbnailStrategy;
}

export interface VideoAnalysisWithImage extends Video {
  base64Thumbnail?: string;
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
  subNiches: string[];
  demandScore: number; // 0-100
  competitionScore: number; // 0-100
  monetizationClass: 'High' | 'Medium' | 'Low';
  saturationLevel: 'Low' | 'Medium' | 'High';
  successProbability: number;
  barrierToEntry: 'Low' | 'Medium' | 'High';
  dominanceRatio: number; // 0-1 (percentage of top results owned by big channels)
  whyItWorks: string;
  sampleIdeas: string[]; // List of 10 video titles/concepts
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

// --- NEW TYPES FOR ADVANCED FEATURES ---

export interface CopyEvent {
  sourceVideoId: string;
  sourceChannelName: string;
  copyVideoId: string;
  copyChannelName: string;
  titleSimilarity: number;
  transcriptSimilarity: number;
  thumbnailSimilarity: number;
  audioSimilarity: number;
  compositeCopyScore: number;
  timeDiffHours: number;
  copyOutcome: 'Success' | 'Fail';
  copyType: 'Direct' | 'Derivative' | 'Format-Reuse' | 'Thumbnail-Mimic';
}

export interface DeepVideoReport {
  videoId: string;
  videoTitle: string;
  originalityStatus: 'Original' | 'Likely Original' | 'Derivative' | 'Likely Copy' | 'Unclear/Concurrent';
  originalityConfidencePct: number;
  topMatches: {
    sourceVideoId: string;
    sourceChannelName: string;
    compositeCopyScore: number;
    timeDiffHours: number;
    copyType: string;
  }[];
  transcriptSimilarity: number;
  titleSimilarity: number;
  thumbnailSimilarity: number;
  audioSimilarity: number;
  microNiche: {
    label: string;
    beginnerOpportunityScore: number;
  };
  roadmap: RoadmapItem[];
  improvementSuggestions: string[];
}

export interface ChannelDrillDown {
  channelId: string;
  channelName: string;
  subscriberCount: string;
  copyBehaviorScore: number; // 0-100
  originatorScore: number; // 0-100
  outliers: Video[];
  copyEvents: CopyEvent[];
  recommendedMicroNiches: MicroNiche[];
  shadowMapData: {
      nodes: { id: string; label: string; type: 'Source' | 'Copy'; date: string }[];
      edges: { from: string; to: string; weight: number }[];
  };
}

export interface BeginnerExplanation {
  cardTitle: string;
  beginnerExplanation: string;
}

// --- REAL DATA TYPES ---
export interface RealChannelData {
  id: string;
  title: string;
  stats: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    stats: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
    duration: string;
  }[];
}

export interface MasterBackupObject {
  version: string;
  timestamp: string;
  config: {
    apiKey?: string;
    youtubeApiKey?: string;
  };
  lastAnalysis?: AnalysisResult | null;
  // Placeholder for future state like tracked niches history
  meta?: {
    appVersion: string;
  };
}

export type LoadingState = 'idle' | 'analyzing' | 'success' | 'error';
