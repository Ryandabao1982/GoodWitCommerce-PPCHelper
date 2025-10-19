import { GoogleGenAI } from '@google/genai';
import { KeywordData, KeywordDeepDiveData } from '../types';
import { loadFromLocalStorage } from '../utils/storage';

const getApiKey = (): string => {
  // First, try to get from localStorage (user settings)
  const savedApiKey = loadFromLocalStorage<string | null>('ppcGeniusApiSettings.geminiApiKey', null);
  if (savedApiKey) {
    return savedApiKey;
  }
  // Fall back to environment variable
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

let genAI: GoogleGenAI | null = null;

const initializeGenAI = () => {
  const apiKey = getApiKey();
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
};

// Initialize on module load
initializeGenAI();

// Export function to reinitialize when settings change
export const reinitializeGeminiService = () => {
  initializeGenAI();
};

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

/**
 * Analyze a single keyword and return detailed metrics
 * Used for manually added keywords to provide AI analysis
 */
export async function analyzeKeyword(keyword: string, brandName: string = ''): Promise<KeywordData> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }

  // Input validation
  if (!keyword || keyword.trim().length === 0) {
    throw new Error('Keyword cannot be empty');
  }

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword.length > 200) {
    throw new Error('Keyword is too long (max 200 characters)');
  }

  const prompt = `You are an Amazon PPC keyword research expert. Analyze this single keyword: "${trimmedKeyword}".
${brandName ? `Brand context: "${brandName}"` : ''}

Provide detailed analysis with:
1. Type: Broad, Phrase, Exact, or Long-tail
2. Category: Core, Opportunity, Branded, Low-hanging Fruit, or Complementary
3. Estimated monthly search volume (e.g., "10k-20k", "500-1k")
4. Competition level: Low, Medium, or High
5. Relevance score (1-10) - rate how specific and actionable this keyword is

Return as JSON with this exact structure:
{
  "keyword": "string",
  "type": "Broad" | "Phrase" | "Exact" | "Long-tail",
  "category": "Core" | "Opportunity" | "Branded" | "Low-hanging Fruit" | "Complementary",
  "searchVolume": "string",
  "competition": "Low" | "Medium" | "High",
  "relevance": number,
  "source": "AI"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    clearTimeout(timeoutId);
    
    const text = response.text || '';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/```\n?(.*?)\n?```/s);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    const data = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!data.keyword || !data.type || !data.category || !data.searchVolume || 
        !data.competition || data.relevance === undefined) {
      throw new Error('Invalid response structure from AI');
    }
    
    // Ensure source is set to AI
    data.source = 'AI';
    
    return data as KeywordData;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Error analyzing keyword:', error);
    throw new Error(`Failed to analyze keyword: ${error.message}`);
  }
}

/**
 * Analyze multiple keywords in batch with rate limiting
 * Processes keywords with delays to avoid API rate limits
 */
export async function analyzeKeywordsBatch(
  keywords: string[], 
  brandName: string = '',
  onProgress?: (completed: number, total: number) => void
): Promise<{ successful: KeywordData[], failed: { keyword: string, error: string }[] }> {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }

  const successful: KeywordData[] = [];
  const failed: { keyword: string, error: string }[] = [];
  
  // Process keywords with rate limiting (max 5 per batch, 1 second delay between batches)
  const batchSize = 5;
  const delayBetweenBatches = 1000; // 1 second
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (keyword) => {
      try {
        const result = await analyzeKeyword(keyword, brandName);
        successful.push(result);
        return { success: true };
      } catch (error: any) {
        failed.push({ keyword, error: error.message });
        return { success: false };
      }
    });
    
    await Promise.all(batchPromises);
    
    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batchSize, keywords.length), keywords.length);
    }
    
    // Delay before next batch (except for last batch)
    if (i + batchSize < keywords.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return { successful, failed };
}
