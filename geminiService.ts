import { GoogleGenAI, Type } from "@google/genai";
import type {
  KeywordData,
  KeywordDeepDiveData,
  Campaign,
  CampaignProjections,
} from "../types";

/**
 * Lazy GoogleGenAI client that is safe for Vite/React in the browser.
 * Reads key from import.meta.env.VITE_GOOGLE_API_KEY and never throws at module load.
 */
let _ai: GoogleGenAI | null = null;

function getApiKey(): string | undefined {
  // @ts-ignore - import.meta exists in Vite/browser builds
  const key = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_API_KEY) as string | undefined;
  return key && String(key).trim() ? key : undefined;
}

function getClient(): GoogleGenAI {
  if (_ai) return _ai;
  const key = getApiKey();
  if (!key) {
    throw new Error(
      "ConfigError: Missing VITE_GOOGLE_API_KEY. Add it to your .env and restart the dev server."
    );
  }
  _ai = new GoogleGenAI({ apiKey: key });
  return _ai;
}

/**
 * Utilities
 */
function stripJsonFences(s: string): string {
  return s.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
}

function cleanJsonString(s: string): string {
  return stripJsonFences(s).replace(/,\s*([}\]])/g, "$1").trim();
}

// ----------------- Public API -----------------

/**
 * Generate keyword suggestions with optional web analysis.
 * Returns [keywords, relatedKeywords]
 */
export async function fetchKeywords(
  seedKeyword: string,
  isWebAnalysisEnabled: boolean,
  brandName?: string
): Promise<[KeywordData[], string[]]> {
  const ai = getClient();

  const brandBlock = brandName?.trim()
    ? `Brand name: "${brandName}". Prefer relevant branded and competitor-adjacent terms.`
    : "No specific brand; avoid fabricating brand names.";

  const prompt = `
Return ONLY JSON.
{
  "keywords": [
    {
      "keyword": "...",
      "type": "Broad|Phrase|Exact|Long-tail",
      "category": "Core|Opportunity|Branded|Low-hanging Fruit|Complementary",
      "searchVolume": "e.g. 5k-10k",
      "competition": "Low|Medium|High",
      "relevance": 1-10,
      "source": "${isWebAnalysisEnabled ? "Web" : "AI"}"
    }
  ],
  "relatedKeywords": ["...", "...", "...", "...", "..."]
}

Seed: "${seedKeyword}"
${brandBlock}
Rules:
- 50-60 total keywords.
- Use diverse match types and categories.
- Do not add commentary outside JSON.
`;

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        keywords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Broad", "Phrase", "Exact", "Long-tail"] },
              category: {
                type: Type.STRING,
                enum: ["Core", "Opportunity", "Branded", "Low-hanging Fruit", "Complementary"],
              },
              searchVolume: { type: Type.STRING },
              competition: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              relevance: { type: Type.INTEGER, minimum: 1, maximum: 10 },
              source: { type: Type.STRING, enum: ["AI", "Web"] },
            },
            required: ["keyword", "type", "category", "searchVolume", "competition", "relevance", "source"],
          },
        },
        relatedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["keywords", "relatedKeywords"],
    },
  };

  if (isWebAnalysisEnabled) {
    config.tools = [{ googleSearch: {} }];
  }

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  // @ts-ignore
  const text = typeof res.text === "function" ? res.text() : String(res.text ?? "");
  const json = JSON.parse(cleanJsonString(text));
  return [json.keywords as KeywordData[], json.relatedKeywords as string[]];
}

/**
 * Cluster keywords into themes.
 */
export async function fetchKeywordClusters(
  keywords: KeywordData[]
): Promise<Record<string, string[]>> {
  const ai = getClient();

  const prompt = `
Return ONLY JSON: {"clusters":[{"clusterName":"...", "keywords":["k1","k2"]}]}
Cluster these keywords into 5-8 coherent PPC themes.
Keywords:
${keywords.map(k => k.keyword).join(", ")}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clusters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                clusterName: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["clusterName", "keywords"],
            },
          },
        },
        required: ["clusters"],
      },
    },
  });

  // @ts-ignore
  const text = typeof res.text === "function" ? res.text() : String(res.text ?? "");
  const json = JSON.parse(cleanJsonString(text));
  const map: Record<string, string[]> = {};
  (json.clusters as Array<{ clusterName: string; keywords: string[] }>).forEach(c => {
    map[c.clusterName] = c.keywords;
  });
  return map;
}

/**
 * Deep-dive for a single keyword.
 */
export async function fetchKeywordDeepDive(
  keyword: string,
  context: string
): Promise<KeywordDeepDiveData> {
  const ai = getClient();

  const prompt = `
Return ONLY JSON:
{
  "adCopyAngles": ["...", "...", "..."],
  "bidStrategy": "...",
  "negativeKeywords": ["...", "...", "...", "...", "..."]
}
Keyword: "${keyword}"
Context: "${context}"
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          adCopyAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
          bidStrategy: { type: Type.STRING },
          negativeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["adCopyAngles", "bidStrategy", "negativeKeywords"],
      },
    },
  });

  // @ts-ignore
  const text = typeof res.text === "function" ? res.text() : String(res.text ?? "");
  return JSON.parse(cleanJsonString(text)) as KeywordDeepDiveData;
}

/**
 * Estimate campaign projections.
 */
export async function fetchCampaignProjections(
  campaign: Campaign
): Promise<CampaignProjections> {
  const ai = getClient();

  const adGroups = campaign.adGroups
    .map(
      (g) =>
        `- ${g.name} (${g.id}): ${g.keywords.slice(0, 30).join(", ")}`
    )
    .join("\n");

  const prompt = `
Return ONLY JSON:
{
  "suggestedAdGroupBudgets": [{"adGroupId":"...", "budget": 500}],
  "estimatedClicks": 1234,
  "estimatedCpc": 0.65,
  "performanceSummary": "..."
}
Campaign: "${campaign.name}"
Budget: ${campaign.totalBudget ?? 0}
Ad groups:
${adGroups}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedAdGroupBudgets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                adGroupId: { type: Type.STRING },
                budget: { type: Type.NUMBER },
              },
              required: ["adGroupId", "budget"],
            },
          },
          estimatedClicks: { type: Type.INTEGER },
          estimatedCpc: { type: Type.NUMBER },
          performanceSummary: { type: Type.STRING },
        },
        required: ["suggestedAdGroupBudgets", "estimatedClicks", "estimatedCpc", "performanceSummary"],
      },
    },
  });

  // @ts-ignore
  const text = typeof res.text === "function" ? res.text() : String(res.text ?? "");
  const json = JSON.parse(cleanJsonString(text));

  const budgetRecord: Record<string, number> = {};
  for (const row of json.suggestedAdGroupBudgets as Array<{ adGroupId: string; budget: number }>) {
    budgetRecord[row.adGroupId] = row.budget;
  }

  return {
    suggestedAdGroupBudgets: budgetRecord,
    estimatedClicks: json.estimatedClicks as number,
    estimatedCpc: json.estimatedCpc as number,
    performanceSummary: json.performanceSummary as string,
  };
}