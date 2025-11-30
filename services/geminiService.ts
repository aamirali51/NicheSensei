
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DeepVideoReport, ChannelDrillDown, RealChannelData } from "../types";

const initAI = (apiKey: string) => new GoogleGenAI({ apiKey });

// --- MAIN ANALYSIS (Keyword / Broad Channel) ---
export const analyzeNicheOrChannel = async (query: string, apiKey: string, realData?: RealChannelData): Promise<AnalysisResult> => {
  const ai = initAI(apiKey);

  const systemInstruction = `
    You are NicheSensei, the ultimate YouTube Research & Analytics Engine.
    Your mission is to perform deep, forensic-level analysis to help new faceless creators dominate their niche.
    
    ${realData ? `
    CRITICAL INSTRUCTION:
    You have been provided with REAL-TIME DATA fetched from the YouTube Data API for the channel "${realData.title}".
    DATA CONTEXT:
    - Subscribers: ${realData.stats.subscriberCount}
    - Total Views: ${realData.stats.viewCount}
    - Video Count: ${realData.stats.videoCount}
    - Recent Videos: ${JSON.stringify(realData.videos.slice(0, 15).map(v => ({ title: v.title, views: v.stats.viewCount, date: v.publishedAt })))}

    YOU MUST USE THIS REAL DATA AS GROUND TRUTH. 
    - Do NOT hallucinate video stats. 
    - Calculate Z-Scores based on the PROVIDED view counts.
    - Base your "Channel Audit" on this actual performance.
    ` : `
    CRITICAL: YOU MUST PERFORM "FULL-SCALE" ANALYSIS. DO NOT LIMIT YOURSELF TO A SUBSET.
    Since no real API data was provided, you must SIMULATE the most accurate data possible based on your training.
    `}
    
    1. CHANNEL ANALYSIS (If query is a channel):
       - Calculate Z-Scores across the history.
       - Identify Outlier++ videos (Z-Score > 2.0).
    
    2. NICHE DISCOVERY (If query is a niche/keyword):
       - Cluster content into Micro-Niches.
       - **FILTERING RULE**: Only recommend sub-niches with a SUCCESS PROBABILITY >= 70%.
       - If a niche is saturated, explicitly warn the user and suggest a pivot.
       - For each niche, provide "Dominance Ratio" (how much big channels own) and "Why it works".
       - Generate 10 distinct, clickable video ideas per niche.

    3. COMPETITOR & COPY MAPPING:
       - Find ALL relevant competitors, not just 2-3.
       - Detect "Shadow Patterns" (smaller channels copying bigger ones).
       - Score copy behavior (0-100).
    
    4. SUCCESS PROJECTION:
       - Calculate "Beginner Opportunity Score" (0-100).
       - < 70% = DO NOT RECOMMEND unless strategy is perfect.
       - >= 80% = STRONGLY RECOMMEND.

    5. OUTPUT:
       - Detailed JSON.
       - No generic advice. Specific, data-backed insights only.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      beginnerOpportunityScore: { type: Type.NUMBER },
      successProbability: { type: Type.NUMBER },
      channelProfile: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          subscriberCount: { type: Type.STRING },
          avgViews: { type: Type.NUMBER },
          medianViews: { type: Type.NUMBER },
          engagementRate: { type: Type.STRING },
          dominantSubNiche: { type: Type.STRING },
        },
        required: ["name", "avgViews", "medianViews"],
      },
      channelAudit: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          expansionOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["strengths", "weaknesses", "expansionOpportunities"],
      },
      videos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            thumbnailUrl: { type: Type.STRING },
            uploadDate: { type: Type.STRING },
            views: { type: Type.NUMBER },
            likes: { type: Type.NUMBER },
            comments: { type: Type.NUMBER },
            duration: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Long", "Short"] },
            zScore: { type: Type.NUMBER },
            viewsPerHour: { type: Type.NUMBER },
            performanceLabel: { type: Type.STRING, enum: ["Outlier++", "Outlier+", "Standard", "Underperformer"] },
          },
          required: ["title", "views", "zScore", "performanceLabel"],
        },
      },
      competitors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            subscribers: { type: Type.STRING },
            similarityScore: { type: Type.NUMBER },
            notes: { type: Type.STRING },
          },
          required: ["name", "similarityScore"],
        },
      },
      shadowAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalVideoId: { type: Type.STRING },
            copycatChannel: { type: Type.STRING },
            copycatTitle: { type: Type.STRING },
            performanceStatus: { type: Type.STRING, enum: ["Better", "Worse", "Similar"] },
            similarityReason: { type: Type.STRING },
          },
          required: ["copycatChannel", "performanceStatus"],
        },
      },
      microNiches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            subNiches: { type: Type.ARRAY, items: { type: Type.STRING } },
            demandScore: { type: Type.NUMBER },
            competitionScore: { type: Type.NUMBER },
            dominanceRatio: { type: Type.NUMBER },
            monetizationClass: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            successProbability: { type: Type.NUMBER },
            barrierToEntry: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            whyItWorks: { type: Type.STRING },
            sampleIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "successProbability", "monetizationClass", "whyItWorks", "sampleIdeas", "dominanceRatio"],
        },
      },
      contentRoadmap: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            structure: { type: Type.STRING },
            ctaStrategy: { type: Type.STRING },
          },
          required: ["title", "hook"],
        },
      },
      globalMonetization: {
        type: Type.OBJECT,
        properties: {
          topRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
          avgRPM: { type: Type.STRING },
        },
        required: ["avgRPM", "topRegions"],
      },
    },
    required: ["summary", "beginnerOpportunityScore", "successProbability", "channelProfile", "videos", "microNiches", "contentRoadmap", "competitors", "shadowAnalysis", "globalMonetization"],
  };

  const prompt = `Analyze: "${query}". Identify Micro-Niche Clusters with >=70% Success Rate. Provide a clear "Why it works" and 10 Sample Ideas for each niche.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema, systemInstruction, temperature: 0.7 },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    const data = JSON.parse(text) as AnalysisResult;
    return sanitizeData(data, realData);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

// --- DEEP VIDEO FORENSICS ---
export const analyzeVideoDeepDive = async (videoUrl: string, apiKey: string): Promise<DeepVideoReport> => {
  const ai = initAI(apiKey);
  
  const systemInstruction = `
    You are NicheSensei - Video Forensic Analyst.
    Task: Analyze a specific video URL for Deep Forensic Data.
    
    1. ORIGINALITY: Determine if it is Original, Derivative, or a Direct Copy.
    2. SIMULATION: Compare against a simulated database of recent videos (Transcript, Title, Thumbnail, Audio).
    3. COMPOSITE SCORE: Use weights (Transcript 35%, Title 30%, etc.).
    4. ATTRIBUTION: Identify the likely "Patient Zero" source video.
    5. ROADMAP: Generate a 10-step reproduction plan for a new creator.
    
    Output strictly in JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      videoId: { type: Type.STRING },
      videoTitle: { type: Type.STRING },
      originalityStatus: { type: Type.STRING, enum: ['Original', 'Likely Original', 'Derivative', 'Likely Copy', 'Unclear/Concurrent'] },
      originalityConfidencePct: { type: Type.NUMBER },
      topMatches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sourceVideoId: { type: Type.STRING },
            sourceChannelName: { type: Type.STRING },
            compositeCopyScore: { type: Type.NUMBER },
            timeDiffHours: { type: Type.NUMBER },
            copyType: { type: Type.STRING },
          }
        }
      },
      transcriptSimilarity: { type: Type.NUMBER },
      titleSimilarity: { type: Type.NUMBER },
      thumbnailSimilarity: { type: Type.NUMBER },
      audioSimilarity: { type: Type.NUMBER },
      microNiche: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          beginnerOpportunityScore: { type: Type.NUMBER },
        }
      },
      roadmap: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: {
             title: { type: Type.STRING },
             hook: { type: Type.STRING },
             structure: { type: Type.STRING },
             ctaStrategy: { type: Type.STRING },
           }
        }
      },
      improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["originalityStatus", "originalityConfidencePct", "topMatches", "roadmap", "microNiche", "videoTitle"]
  };

  const prompt = `Perform forensic analysis on video: "${videoUrl}". Simulate a search against recent uploads to find potential copies or sources.`;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema, systemInstruction, temperature: 0.5 },
    });
    return JSON.parse(response.text || "{}") as DeepVideoReport;
  } catch(e) { console.error(e); throw e; }
};

// --- CHANNEL DEEP DIVE ---
export const analyzeChannelDeepDive = async (channelName: string, apiKey: string): Promise<ChannelDrillDown> => {
   const ai = initAI(apiKey);

   const systemInstruction = `
     You are NicheSensei - Competitive Intelligence Unit.
     Perform a full deep-dive on the channel.
     
     1. COPY BEHAVIOR: Score (0-100). Do they steal ideas?
     2. ORIGINATOR SCORE: Score (0-100). Do they invent trends?
     3. SHADOW MAP: Graph their relationships (Source vs Copy).
     4. VULNERABILITIES: Find weak spots where a new creator can win.
     5. RECOMMENDATIONS: Suggest niches to attack.
   `;

   const schema = {
     type: Type.OBJECT,
     properties: {
       channelId: { type: Type.STRING },
       channelName: { type: Type.STRING },
       subscriberCount: { type: Type.STRING },
       copyBehaviorScore: { type: Type.NUMBER },
       originatorScore: { type: Type.NUMBER },
       outliers: {
         type: Type.ARRAY,
         items: {
           type: Type.OBJECT,
           properties: {
             id: { type: Type.STRING },
             title: { type: Type.STRING },
             thumbnailUrl: { type: Type.STRING },
             uploadDate: { type: Type.STRING },
             views: { type: Type.NUMBER },
             likes: { type: Type.NUMBER },
             comments: { type: Type.NUMBER },
             duration: { type: Type.STRING },
             type: { type: Type.STRING },
             zScore: { type: Type.NUMBER },
             viewsPerHour: { type: Type.NUMBER },
             performanceLabel: { type: Type.STRING }
           }
         }
       },
       copyEvents: {
         type: Type.ARRAY,
         items: {
           type: Type.OBJECT,
           properties: {
             sourceVideoId: { type: Type.STRING },
             sourceChannelName: { type: Type.STRING },
             copyVideoId: { type: Type.STRING },
             copyChannelName: { type: Type.STRING },
             titleSimilarity: { type: Type.NUMBER },
             transcriptSimilarity: { type: Type.NUMBER },
             thumbnailSimilarity: { type: Type.NUMBER },
             audioSimilarity: { type: Type.NUMBER },
             compositeCopyScore: { type: Type.NUMBER },
             timeDiffHours: { type: Type.NUMBER },
             copyOutcome: { type: Type.STRING },
             copyType: { type: Type.STRING },
           }
         }
       },
       recommendedMicroNiches: {
         type: Type.ARRAY,
         items: {
           type: Type.OBJECT,
            properties: {
            name: { type: Type.STRING },
            subNiches: { type: Type.ARRAY, items: { type: Type.STRING } },
            demandScore: { type: Type.NUMBER },
            competitionScore: { type: Type.NUMBER },
            dominanceRatio: { type: Type.NUMBER },
            monetizationClass: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            successProbability: { type: Type.NUMBER },
            barrierToEntry: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            whyItWorks: { type: Type.STRING },
            sampleIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "successProbability", "monetizationClass"],
         }
       },
       shadowMapData: {
         type: Type.OBJECT,
         properties: {
           nodes: { 
             type: Type.ARRAY, 
             items: { 
               type: Type.OBJECT, 
               properties: { id: {type: Type.STRING}, label: {type: Type.STRING}, type: {type: Type.STRING}, date: {type: Type.STRING} } 
             } 
           },
           edges: { 
             type: Type.ARRAY, 
             items: { 
               type: Type.OBJECT, 
               properties: { from: {type: Type.STRING}, to: {type: Type.STRING}, weight: {type: Type.NUMBER} } 
             } 
           }
         }
       }
     },
     required: ["channelName", "copyBehaviorScore", "originatorScore", "copyEvents", "shadowMapData"]
   };

   const prompt = `Deep dive analysis for channel: "${channelName}". Simulate detailed copy events and shadow map.`;

   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema, systemInstruction, temperature: 0.6 },
    });
    
    const data = JSON.parse(response.text || "{}") as ChannelDrillDown;
    // Post-process defaults
    data.outliers = (data.outliers || []).map((v, i) => ({
       ...v,
       thumbnailUrl: `https://picsum.photos/seed/${v.id || i + 'od'}/320/180`,
       performanceLabel: (v.performanceLabel as any) || 'Standard'
    }));
    data.recommendedMicroNiches = data.recommendedMicroNiches || [];
    data.copyEvents = data.copyEvents || [];
    data.shadowMapData = data.shadowMapData || { nodes: [], edges: [] };

    return data;
  } catch(e) { console.error(e); throw e; }
};

// Helper to sanitize main analysis data
function sanitizeData(data: AnalysisResult, realData?: RealChannelData): AnalysisResult {
    data.videos = Array.isArray(data.videos) ? data.videos : [];
    data.microNiches = Array.isArray(data.microNiches) ? data.microNiches : [];
    data.competitors = Array.isArray(data.competitors) ? data.competitors : [];
    data.shadowAnalysis = Array.isArray(data.shadowAnalysis) ? data.shadowAnalysis : [];
    data.contentRoadmap = Array.isArray(data.contentRoadmap) ? data.contentRoadmap : [];
    
    if (data.channelAudit) {
        data.channelAudit.strengths = Array.isArray(data.channelAudit.strengths) ? data.channelAudit.strengths : [];
        data.channelAudit.weaknesses = Array.isArray(data.channelAudit.weaknesses) ? data.channelAudit.weaknesses : [];
        data.channelAudit.expansionOpportunities = Array.isArray(data.channelAudit.expansionOpportunities) ? data.channelAudit.expansionOpportunities : [];
    }

    // IF real data exists, we rely on the AI to have used it, but we can double check/overwrite images if needed
    // However, the AI response should already contain the data formatted correctly.
    // If it was a simulation, we add placeholder images.
    
    data.videos = data.videos.map((v, index) => {
        // If real data was used, the AI might have passed the real thumbnail URL, 
        // OR if it's new generation, we might need to map it back if the AI didn't include the thumb url in output.
        // For simplicity, if we have real data, we try to match by title to get the real thumbnail.
        let realThumb = v.thumbnailUrl;
        if (realData && (!realThumb || realThumb.includes('picsum'))) {
            const match = realData.videos.find(rv => rv.title === v.title);
            if (match) realThumb = match.thumbnail;
        }

        return {
            ...v,
            thumbnailUrl: realThumb || `https://picsum.photos/seed/${v.id || index + 'v'}/320/180`,
            id: v.id || `vid-${index}`
        };
    });

    // Ensure new fields exist
    data.microNiches = data.microNiches.map(n => ({
      ...n,
      subNiches: n.subNiches || [],
      whyItWorks: n.whyItWorks || "High demand and low competition detected.",
      sampleIdeas: n.sampleIdeas || [],
      dominanceRatio: n.dominanceRatio || 0.1
    }));

    return data;
}
