import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeNicheOrChannel = async (query: string, apiKey: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an advanced YouTube Research & Analytics Engine.
    Your job is to analyze channels, videos, niches, markets, and global content trends to help new creators find the highest-success micro-niches with the least competition.
    You must produce extremely detailed, structured, data-backed insights and actionable recommendations.
    You must always prioritize beginner success, global faceless content, and high-RPM niches.

    🎯 MAIN OBJECTIVES

    When the user enters ANYTHING (channel URL, video URL, keyword, or niche), perform:

    1. Outlier Video Detection (vidIQ-style)
    Use deep statistical analysis:
    Compute channel median views
    Compute z-score for each video
    Label videos:
    Outlier++ = z-score ≥ +2
    Outlier+ = z-score between +1 and +2
    Underperformer = z-score ≤ –1
    Separate detection for Shorts vs Long-form
    Include:
    Views-per-hour (VPH)
    7-day growth slope

    2. Sub-Niche Discovery (AI Clustering)
    Return micro-niches with:
    Demand score
    Competition score
    Creator dominance ratio
    Monetization class (Low/Med/High RPM)

    3. Beginner-Friendly Opportunity Finder
    Score each micro-niche:
    Beginner Opportunity Score (0–100)
    Saturation Level (Low/Med/High)
    Barrier to Entry (Low/Medium/High)
    Success Probability for New Channel (%)

    4. Copy & Shadow Detection (Competitor Behavior)
    For any successful video:
    Identify similar videos posted within ±30 days
    Evaluate: Did the copies succeed or fail?

    5. High-RPM Monetization Mapping
    Classify each niche/sub-niche based on advertiser behavior.

    6. Keyword & Content Opportunity Engine
    For every niche/sub-niche:
    Generate long-tail YouTube keyword opportunities
    Provide a 10-video starter roadmap with:
    Title
    Hook idea
    Retention structure
    CTA strategy

    7. Channel Audit (Full Breakdown)
    If user inputs a channel URL/Name, deliver:
    What the channel is doing right/wrong
    Which videos are carrying the channel
    Which videos drag performance
    Expansion opportunities

    8. Faceless Content Optimization
    Always optimize for:
    Faceless narration, Stock footage, AI voice

    9. Success Probability Enhancer
    Output:
    Success probability (%) for a new small channel
    Global RPM potential

    RETURN PURE JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      beginnerOpportunityScore: { type: Type.NUMBER, description: "0-100 score for a beginner entering this niche" },
      successProbability: { type: Type.NUMBER, description: "0-100 probability of success" },
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
            demandScore: { type: Type.NUMBER },
            competitionScore: { type: Type.NUMBER },
            monetizationClass: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            successProbability: { type: Type.NUMBER },
            barrierToEntry: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "successProbability", "monetizationClass"],
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
    required: [
      "summary", 
      "beginnerOpportunityScore", 
      "successProbability", 
      "channelProfile", 
      "videos", 
      "microNiches", 
      "contentRoadmap",
      "competitors",
      "shadowAnalysis",
      "globalMonetization"
    ],
  };

  const prompt = `
    Analyze the niche/channel: "${query}".
    
    1. Generate 20 recent videos. 
    2. Identify Micro-Niche Clusters.
    3. Calculate scores (Z-Score, Opportunity Score, etc) based on a simulated market analysis.
    4. Provide a 10-video roadmap for a beginner.
    
    Ensure the data reflects a realistic scenario for "${query}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    const data = JSON.parse(text) as AnalysisResult;
    
    // Post-processing Safety Checks
    // Ensure all arrays are initialized to avoid "undefined.map" errors
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

    // Process videos
    data.videos = data.videos.map((v, index) => ({
        ...v,
        // Ensure image is set
        thumbnailUrl: `https://picsum.photos/seed/${v.id || index + 'v'}/320/180`,
        id: v.id || `vid-${index}`
    }));

    return data;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
