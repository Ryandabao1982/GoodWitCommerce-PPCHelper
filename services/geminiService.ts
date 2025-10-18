import { GoogleGenAI } from '@google/genai';
import { KeywordData, KeywordDeepDiveData } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

export async function fetchKeywords(
  seedKeyword: string,
  isWebAnalysisEnabled: boolean,
  brandName: string = ''
): Promise<[KeywordData[], string[]]> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are an Amazon PPC keyword research expert. Generate a comprehensive list of ${isWebAnalysisEnabled ? '50' : '30'} high-quality keywords for the seed keyword: "${seedKeyword}".
${brandName ? `Brand context: "${brandName}"` : ''}

For each keyword, provide:
1. The keyword phrase
2. Type: Broad, Phrase, Exact, or Long-tail
3. Category: Core, Opportunity, Branded, Low-hanging Fruit, or Complementary
4. Estimated monthly search volume (e.g., "10k-20k", "500-1k")
5. Competition level: Low, Medium, or High
6. Relevance score (1-10) relative to the seed keyword
7. Source: AI ${isWebAnalysisEnabled ? 'or Web' : ''}

Also provide 5-10 related keyword ideas for further exploration.

Format your response as JSON with this structure:
{
  "keywords": [
    {
      "keyword": "string",
      "type": "Broad" | "Phrase" | "Exact" | "Long-tail",
      "category": "Core" | "Opportunity" | "Branded" | "Low-hanging Fruit" | "Complementary",
      "searchVolume": "string",
      "competition": "Low" | "Medium" | "High",
      "relevance": number,
      "source": "AI" | "Web"
    }
  ],
  "relatedIdeas": ["string"]
}`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const text = response.text || '';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/```\n?(.*?)\n?```/s);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    const data = JSON.parse(jsonText);
    return [data.keywords || [], data.relatedIdeas || []];
  } catch (error: any) {
    console.error('Error fetching keywords:', error);
    throw new Error(`Failed to fetch keywords: ${error.message}`);
  }
}

export async function fetchKeywordClusters(keywords: KeywordData[]): Promise<Record<string, string[]>> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }
  
  const keywordList = keywords.map(k => k.keyword).join(', ');
  
  const prompt = `You are an Amazon PPC expert. Analyze these keywords and group them into logical clusters based on search intent and theme: ${keywordList}

Create 3-7 clusters with meaningful names. Return the result as JSON:
{
  "Cluster Name 1": ["keyword1", "keyword2"],
  "Cluster Name 2": ["keyword3", "keyword4"]
}`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const text = response.text || '';
    
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/```\n?(.*?)\n?```/s);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Error clustering keywords:', error);
    throw new Error(`Failed to cluster keywords: ${error.message}`);
  }
}

export async function fetchKeywordDeepDive(keyword: string): Promise<KeywordDeepDiveData> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }
  
  const prompt = `You are an Amazon PPC expert. Provide a deep dive analysis for the keyword: "${keyword}"

Include:
1. 3-5 ad copy angles that would perform well
2. A recommended bid strategy
3. 5-10 negative keywords to prevent wasted spend

Return as JSON:
{
  "adCopyAngles": ["string"],
  "bidStrategy": "string",
  "negativeKeywords": ["string"]
}`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const text = response.text || '';
    
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/```\n?(.*?)\n?```/s);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Error fetching keyword deep dive:', error);
    throw new Error(`Failed to fetch keyword analysis: ${error.message}`);
  }
}
