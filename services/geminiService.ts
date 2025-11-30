import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to calculate outlier scores purely in JS if needed, but we'll ask AI to prep the data
// We will ask AI to generate realistic data based on the niche/channel provided.

export const analyzeNicheOrChannel = async (query: string, apiKey: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an advanced YouTube Analytics Engine specialized in Faceless YouTube Channel strategy.
    Your goal is to simulate a deep-dive analysis of a specific YouTube channel or Niche.
    
    If the user input is a generic niche (e.g., "True Crime"), invent a representative "market leader" channel profile for that niche and analyze it.
    If the user input is a specific channel name (e.g., "Bright Side"), generate realistic estimated data for that channel.

    Key Metric Definitions:
    - Outlier Score: Video Views / Channel Average Views.
    - Shadow Analysis: Detect if other channels copied successful videos.
    - Sub-Niche: Specific topic clusters within the main niche.

    Return PURE JSON data.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
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
            growthVelocity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          },
          required: ["title", "views", "uploadDate", "type"],
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
      subNiches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            competitionLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            demandLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            rpmEstimate: { type: Type.STRING },
            successProbability: { type: Type.NUMBER },
            recommendedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "successProbability", "rpmEstimate"],
        },
      },
      contentStrategy: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            format: { type: Type.STRING },
            facelessTechnique: { type: Type.STRING },
            hook: { type: Type.STRING },
          },
          required: ["title", "facelessTechnique"],
        },
      },
      globalMonetization: {
        type: Type.OBJECT,
        properties: {
          topRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
          avgRPM: { type: Type.STRING },
        },
        required: ["avgRPM"],
      },
    },
    required: ["channelProfile", "videos", "competitors", "subNiches", "contentStrategy", "globalMonetization"],
  };

  const prompt = `
    Analyze the niche/channel: "${query}".
    
    1. Generate 20 recent videos. Make sure to include 3-4 "Outlier" videos with significantly higher views (3x-10x average) to demonstrate viral hits.
    2. Suggest 3-5 profitable sub-niches for a beginner.
    3. Identify 3 similar channels.
    4. Create 3 examples of "Shadow Analysis" where a competitor copied a video.
    5. Suggest 5 faceless video ideas.
    
    Use realistic metrics for the Niche.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative to generate realistic variations
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    const data = JSON.parse(text) as AnalysisResult;
    
    // Post-processing: Calculate Outlier Scores client-side to ensure mathematical accuracy
    // and assign valid thumbnail placeholders if missing
    data.videos = data.videos.map((v, index) => ({
        ...v,
        outlierScore: parseFloat((v.views / data.channelProfile.avgViews).toFixed(2)),
        // Assign a random realistic image based on index to keep it consistent
        thumbnailUrl: `https://picsum.photos/seed/${v.id || index}/320/180`,
        id: v.id || `vid-${index}`
    }));

    return data;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
