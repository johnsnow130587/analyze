
import { GoogleGenAI, Type } from "@google/genai";
import { type AnalysisResult } from '../types';

const competitorSchema = {
    type: Type.OBJECT,
    properties: {
        website: { type: Type.STRING, description: 'The competitor\'s full URL.' },
        estimatedTraffic: { type: Type.STRING, description: 'A qualitative estimation of the competitor\'s traffic (e.g., "Low", "Medium", "High").' },
        niche: { type: Type.STRING, description: 'The main category or industry of the competitor.' },
        topKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 2-3 primary keywords the competitor likely ranks for.'
        },
    },
    required: ['website', 'estimatedTraffic', 'niche', 'topKeywords']
};

const topKeywordsSchema = {
    type: Type.OBJECT,
    properties: {
        keyword: { type: Type.STRING, description: 'The search keyword.' },
        traffic: { type: Type.STRING, description: 'The estimated monthly traffic or traffic share for this keyword (e.g., "High", "15k/mo", "25%").' },
    },
    required: ['keyword', 'traffic']
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    website: { type: Type.STRING, description: 'The full URL of the website being analyzed.' },
    niche: { type: Type.STRING, description: 'The main category or industry of the website.' },
    country: { type: Type.STRING, description: 'The primary country the website targets or receives traffic from.' },
    monthlyVisits: { type: Type.STRING, description: 'Estimated total visits for the last month (e.g., "1.2M", "550K").' },
    uniqueVisitors: { type: Type.STRING, description: 'Estimated number of distinct individuals visiting the site last month.' },
    pageViews: { type: Type.STRING, description: 'Estimated total number of pages viewed last month.' },
    globalRank: { type: Type.INTEGER, description: 'The site’s popularity rank compared to all other sites worldwide.' },
    countryRank: { type: Type.INTEGER, description: 'The site’s popularity rank within its primary country.' },
    bounceRate: { type: Type.STRING, description: 'The estimated percentage of visitors who leave after viewing only one page (e.g., "45%").' },
    avgVisitDuration: { type: Type.STRING, description: 'Estimated average time a user stays on the site per session (e.g., "00:04:21").' },
    trafficChannelBreakdown: {
      type: Type.OBJECT,
      description: 'A key-value map showing the percentage split of traffic from different channels (e.g., {"Direct": 40, "Organic Search": 35}).',
      properties: {
          Direct: { type: Type.NUMBER },
          'Organic Search': { type: Type.NUMBER },
          'Paid Search': { type: Type.NUMBER },
          Referrals: { type: Type.NUMBER },
          Social: { type: Type.NUMBER },
          Mail: { type: Type.NUMBER },
      }
    },
    topReferrers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'An array of the top 3-5 specific websites that send the most referral traffic.'
    },
    domainAuthority: {
      type: Type.INTEGER,
      description: 'An estimated Domain Authority score from 1 to 100, predicting its ranking strength.'
    },
    referringDomains: { type: Type.STRING, description: 'Estimated number of unique domains linking to the site (e.g., "1.2k", "87").' },
    organicKeywords: { type: Type.STRING, description: 'Estimated number of keywords the site ranks for in search engines (e.g., "15.5k", "500").' },
    topKeywordsByTraffic: {
        type: Type.ARRAY,
        items: topKeywordsSchema,
        description: 'An array of the top organic keywords driving traffic to the site.'
    },
    geographicDistribution: {
        type: Type.OBJECT,
        description: 'A key-value map of the top countries by traffic share percentage.',
        properties: {}
    },
    deviceSplit: {
        type: Type.OBJECT,
        description: 'A key-value map showing the percentage of traffic from Mobile vs. Desktop.',
        properties: {
            Desktop: { type: Type.NUMBER },
            Mobile: { type: Type.NUMBER },
        }
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 2-3 actionable suggestions for traffic growth.'
    },
    keyCompetitors: {
        type: Type.ARRAY,
        items: competitorSchema,
        description: 'An array of 2-3 key competitors with their details.'
    },
  },
  required: ['website', 'niche', 'country', 'monthlyVisits', 'uniqueVisitors', 'pageViews', 'globalRank', 'countryRank', 'bounceRate', 'avgVisitDuration', 'trafficChannelBreakdown', 'topReferrers', 'domainAuthority', 'referringDomains', 'organicKeywords', 'topKeywordsByTraffic', 'geographicDistribution', 'deviceSplit', 'improvementSuggestions', 'keyCompetitors']
};

type AnalysisMode = "fast" | "deep";

const MODEL_BY_MODE: Record<AnalysisMode, string> = {
  fast: "gemini-2.0-flash-exp",
  deep: "gemini-2.0-pro-exp",
};

async function analyzeBatch(urls: string[], apiKey: string, mode: AnalysisMode): Promise<AnalysisResult[]> {
    if (!apiKey) {
        console.error("Gemini API key is missing when attempting to analyze batch.");
        return [];
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = MODEL_BY_MODE[mode] ?? MODEL_BY_MODE.fast;

    const prompt = `
You are a world-class SEO, growth, and market‑intelligence analyst, simulating tools like Ahrefs, SimilarWeb, and professional consulting insight.

Analyze the following list of websites. For EACH website:
- Infer realistic traffic and ranking metrics that are internally consistent (monthlyVisits, uniqueVisitors, pageViews, bounceRate, avgVisitDuration, domainAuthority, referringDomains, organicKeywords, trafficChannelBreakdown, geographicDistribution, deviceSplit).
- Identify the true business model and monetization approach (e.g. affiliate, ads, SaaS, e‑commerce, lead‑gen) and reflect that in niche, traffic channels, and topKeywordsByTraffic.
- Choose keyCompetitors that are genuinely close alternatives in the same niche and similar audience size, not giant generic sites.
- Provide improvementSuggestions that are sharp, specific, and immediately actionable for driving more qualified traffic and revenue, not generic SEO tips.
- Make sure all numeric percentages in trafficChannelBreakdown and deviceSplit add up to roughly 100% (±3%).

Base everything only on what a smart analyst could infer from the URL, brand name, and common patterns in that niche – do NOT claim to use live data.

Return ONLY a well‑structured JSON array, one object per website, strictly matching the provided JSON schema.

Websites to analyze:
${urls.join("\n")}
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: analysisSchema
                },
            },
        });

        const jsonText = response.text;
        if (!jsonText) {
            console.warn(`Received an empty response for batch: ${urls.join(', ')}`);
            return [];
        }

        const results: AnalysisResult[] = JSON.parse(jsonText);
        return results;

    } catch (error)
        {
        console.error(`Error analyzing batch starting with ${urls[0]}:`, error);
        return [];
    }
}

export async function analyzeWebsites(urls: string[], apiKey: string, mode: AnalysisMode = "fast"): Promise<AnalysisResult[]> {
  const BATCH_SIZE = 25;
  const batches: string[][] = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      batches.push(urls.slice(i, i + BATCH_SIZE));
  }
  
  try {
    const batchPromises = batches.map(batch => analyzeBatch(batch, apiKey, mode));
    const resultsFromBatches = await Promise.all(batchPromises);
    
    const allResults = resultsFromBatches.flat();
    
    if (allResults.length === 0 && urls.length > 0) {
        throw new Error("All analysis batches failed. Please check the console for errors and try again.");
    }
    
    return allResults;

  } catch(error) {
      console.error("Error processing website analysis batches:", error);
      throw new Error("Failed to get analysis from Gemini API. The model may be unable to process the provided URLs or the request was blocked.");
  }
}
