import { GoogleGenAI } from '@google/genai';
import { SOP } from '../types';
import { loadFromLocalStorage } from '../utils/storage';

// Get API key from localStorage or environment
const getApiKey = (): string => {
  const savedKey = loadFromLocalStorage<string>('ppcGeniusApiSettings.geminiApiKey', '');
  return savedKey || import.meta.env.VITE_GEMINI_API_KEY || '';
};

let genAI: GoogleGenAI | null = null;

const initializeGemini = () => {
  const apiKey = getApiKey();
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
};

// Initialize on module load
initializeGemini();

// Export function to reinitialize when settings change
export const reinitializeSOPService = () => {
  initializeGemini();
};

/**
 * Search SOPs using AI to provide intelligent answers
 */
export const aiSearchSOPs = async (query: string, sops: SOP[]): Promise<string> => {
  initializeGemini();
  
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context from all SOPs
    const sopContext = sops.map(sop => 
      `Title: ${sop.title}\nCategory: ${sop.category}\nContent: ${sop.content}\nTags: ${sop.tags.join(', ')}`
    ).join('\n\n---\n\n');

    const prompt = `You are a helpful assistant for an Amazon PPC Keyword Research tool. 
You have access to the following Standard Operating Procedures (SOPs) and guides:

${sopContext}

User Question: ${query}

Based on the SOPs above, provide a clear, concise, and actionable answer to the user's question.
If the SOPs don't contain relevant information, say so and provide general guidance if appropriate.
Format your response in a friendly, professional manner.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error in AI search:', error);
    throw new Error('Failed to perform AI search');
  }
};

/**
 * Get AI-powered SOP recommendations based on current context
 */
export const getAIRecommendedSOPs = async (
  sops: SOP[],
  context?: {
    recentSearches?: string[];
    currentView?: string;
    activeBrand?: string;
  }
): Promise<SOP[]> => {
  initializeGemini();
  
  if (!genAI || sops.length === 0) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextInfo = context ? `
Current Context:
- Recent searches: ${context.recentSearches?.join(', ') || 'None'}
- Current view: ${context.currentView || 'Unknown'}
- Active brand: ${context.activeBrand || 'None'}
` : '';

    const sopTitles = sops.map((sop, idx) => 
      `${idx}. ${sop.title} (${sop.category})`
    ).join('\n');

    const prompt = `You are helping a user working with an Amazon PPC Keyword Research tool.
${contextInfo}

Available SOPs:
${sopTitles}

Based on the user's current context and workflow, recommend 3-5 most relevant SOPs by their index numbers.
Respond with ONLY a comma-separated list of index numbers, e.g., "0,3,7"`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    // Parse the response to get indices
    const indices = response.split(',')
      .map(s => parseInt(s.trim()))
      .filter(idx => !isNaN(idx) && idx >= 0 && idx < sops.length);

    return indices.map(idx => sops[idx]).slice(0, 5);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Fallback: return most recently updated SOPs
    return [...sops]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }
};

/**
 * Suggest smart categories for a new SOP based on its content
 */
export const suggestSOPCategory = async (title: string, content: string): Promise<string> => {
  initializeGemini();
  
  if (!genAI) {
    return 'General';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Categorize this Standard Operating Procedure into ONE of these categories:
- Campaign Management
- Keyword Research
- Brand Setup
- Performance Analysis
- Optimization
- Reporting
- General

Title: ${title}
Content: ${content.substring(0, 500)}

Respond with ONLY the category name, nothing else.`;

    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();
    
    const validCategories = [
      'Campaign Management',
      'Keyword Research',
      'Brand Setup',
      'Performance Analysis',
      'Optimization',
      'Reporting',
      'General',
    ];

    return validCategories.includes(category) ? category : 'General';
  } catch (error) {
    console.error('Error suggesting category:', error);
    return 'General';
  }
};

/**
 * Generate smart tags for a SOP based on its content
 */
export const generateSOPTags = async (title: string, content: string): Promise<string[]> => {
  initializeGemini();
  
  if (!genAI) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate 3-7 relevant tags for this Standard Operating Procedure.
Tags should be short, lowercase, and help with searchability.

Title: ${title}
Content: ${content.substring(0, 500)}

Respond with a comma-separated list of tags, e.g., "ppc, amazon, campaigns, setup"`;

    const result = await model.generateContent(prompt);
    const tagsText = result.response.text().trim();
    
    return tagsText
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 30)
      .slice(0, 7);
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
};

/**
 * AI Assistant to help create and format SOPs with professional structure
 */
export const aiAssistSOPCreation = async (input: {
  topic?: string;
  context?: string;
  existingContent?: string;
  action: 'create' | 'improve' | 'format' | 'expand';
}): Promise<string> => {
  initializeGemini();
  
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';

    switch (input.action) {
      case 'create':
        prompt = `You are an expert technical writer creating Standard Operating Procedures for Amazon PPC keyword research and campaign management.

Create a well-structured, professional SOP on the following topic:
Topic: ${input.topic || 'General PPC Process'}
${input.context ? `Context: ${input.context}` : ''}

Format the SOP with:
1. Clear, numbered steps
2. Bullet points for sub-tasks
3. Important notes or warnings (marked with ⚠️)
4. Tips or best practices (marked with 💡)
5. Professional, concise language
6. Actionable instructions

Make it comprehensive but easy to follow.`;
        break;

      case 'improve':
        prompt = `You are an expert technical writer improving Standard Operating Procedures.

Current SOP content:
${input.existingContent}

Improve this SOP by:
1. Making instructions clearer and more actionable
2. Adding missing steps or details
3. Organizing content with better structure
4. Adding relevant notes, warnings (⚠️), or tips (💡)
5. Ensuring professional tone and formatting
6. Fixing any grammar or clarity issues

Return the improved version.`;
        break;

      case 'format':
        prompt = `You are an expert technical writer formatting Standard Operating Procedures.

Current content:
${input.existingContent}

Format this content professionally with:
1. Clear hierarchical structure (numbered steps, bullet points)
2. Consistent formatting
3. Proper use of emojis for emphasis (⚠️ for warnings, 💡 for tips, ✅ for checkpoints)
4. Well-organized sections
5. Improved readability

Keep all the content but make it look professional and easy to follow.`;
        break;

      case 'expand':
        prompt = `You are an expert in Amazon PPC and keyword research expanding a Standard Operating Procedure.

Current SOP:
${input.existingContent}
${input.context ? `\nAdditional context: ${input.context}` : ''}

Expand this SOP by:
1. Adding more detailed steps where needed
2. Including examples or scenarios
3. Adding troubleshooting tips
4. Including best practices and common pitfalls
5. Adding relevant metrics or benchmarks to watch
6. Maintaining the existing structure and flow

Make it more comprehensive while keeping it actionable.`;
        break;
    }

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error in AI SOP assistant:', error);
    throw new Error('Failed to generate SOP content');
  }
};

/**
 * Generate a complete SOP from a brief description
 */
export const generateCompleteSOP = async (
  title: string,
  briefDescription: string
): Promise<{ content: string; category: string; tags: string[] }> => {
  initializeGemini();
  
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Generate the main content
    const content = await aiAssistSOPCreation({
      topic: title,
      context: briefDescription,
      action: 'create',
    });

    // Generate category and tags in parallel
    const [category, tags] = await Promise.all([
      suggestSOPCategory(title, content),
      generateSOPTags(title, content),
    ]);

    return { content, category, tags };
  } catch (error) {
    console.error('Error generating complete SOP:', error);
    throw new Error('Failed to generate complete SOP');
  }
};
