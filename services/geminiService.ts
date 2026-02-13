
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
        type: Type.ARRAY,
        description: 'An array of objects for the top countries by traffic share percentage. Each object should have a "country" and a "percentage".',
        items: {
            type: Type.OBJECT,
            properties: {
                country: {
                    type: Type.STRING,
                    description: 'The name of the country.'
                },
                percentage: {
                    type: Type.NUMBER,
                    description: 'The traffic percentage from this country.'
                }
            },
            required: ['country', 'percentage']
        }
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

async function analyzeBatch(urls: string[]): Promise<AnalysisResult[]> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const prompt = `
        You are a world-class SEO and market intelligence analyst, simulating tools like Ahrefs and SimilarWeb.
        Analyze the following list of websites. For each website, provide educated estimates for all fields in the provided JSON schema.
        Your analysis should be concise, data-driven, and based on the public-facing information about the given websites (niche, content, apparent scale).
        Do not attempt to access live traffic data. Your response must be a well-structured array of JSON objects, one for each website.

        Websites to analyze:
        ${urls.join('\n')}
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
            // Treat an empty response as a failure for this batch.
            throw new Error("The analysis returned an empty response.");
        }

        const results: AnalysisResult[] = JSON.parse(jsonText);
        return results;

    } catch (error) {
        console.error(`Error analyzing batch starting with ${urls[0]}:`, error);
        // Re-throw the error so it can be caught by the main handler in App.tsx
        // This provides a much better user-facing error.
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The configured API key is invalid or has been rejected by the service.');
            }
        }
        throw error;
    }
}

export async function analyzeWebsites(urls: string[]): Promise<AnalysisResult[]> {
  const BATCH_SIZE = 25;
  const batches: string[][] = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      batches.push(urls.slice(i, i + BATCH_SIZE));
  }
  
  try {
    const batchPromises = batches.map(batch => analyzeBatch(batch));
    const resultsFromBatches = await Promise.all(batchPromises);
    
    const allResults = resultsFromBatches.flat();
    
    // This check is now a fallback, as analyzeBatch will throw on error.
    if (allResults.length === 0 && urls.length > 0) {
        throw new Error("Analysis completed but returned no data. The model may have been unable to process the requested URLs due to content restrictions.");
    }
    
    return allResults;

  } catch(error) {
      console.error("Error processing website analysis batches:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to get analysis from Gemini API. The model may be unable to process the provided URLs or the request was blocked.");
  }
}