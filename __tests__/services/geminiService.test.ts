import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KeywordData, KeywordDeepDiveData } from '../../types';

// Mock the entire geminiService module
const mockGenerateContent = vi.fn();

// Set the API key in environment before importing
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key-123');

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

// Import after mocking
const { fetchKeywords, fetchKeywordClusters, fetchKeywordDeepDive } = await import('../../services/geminiService');

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  describe('fetchKeywords', () => {
    it('should fetch keywords successfully with AI response', async () => {
      const mockResponse = {
        keywords: [
          {
            keyword: 'bluetooth speaker',
            type: 'Broad',
            category: 'Core',
            searchVolume: '10k-20k',
            competition: 'High',
            relevance: 10,
            source: 'AI',
          },
          {
            keyword: 'portable bluetooth speaker',
            type: 'Phrase',
            category: 'Opportunity',
            searchVolume: '5k-10k',
            competition: 'Medium',
            relevance: 9,
            source: 'AI',
          },
        ],
        relatedIdeas: ['wireless speaker', 'portable audio', 'outdoor speaker'],
      };

      // Mock the API call
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockResponse),
      });

      const [keywords, relatedIdeas] = await fetchKeywords('bluetooth speaker', false);

      expect(keywords).toHaveLength(2);
      expect(keywords[0].keyword).toBe('bluetooth speaker');
      expect(keywords[0].type).toBe('Broad');
      expect(relatedIdeas).toHaveLength(3);
      expect(relatedIdeas[0]).toBe('wireless speaker');
    });

    it('should handle JSON in code blocks', async () => {
      const mockResponse = {
        keywords: [
          {
            keyword: 'test keyword',
            type: 'Exact',
            category: 'Core',
            searchVolume: '1k-5k',
            competition: 'Low',
            relevance: 8,
            source: 'AI',
          },
        ],
        relatedIdeas: ['related keyword'],
      };

      mockGenerateContent.mockResolvedValue({
        text: '```json\n' + JSON.stringify(mockResponse) + '\n```',
      });

      const [keywords, relatedIdeas] = await fetchKeywords('test', false);

      expect(keywords).toHaveLength(1);
      expect(relatedIdeas).toHaveLength(1);
    });

    it('should handle web analysis mode', async () => {
      const mockResponse = {
        keywords: [
          {
            keyword: 'web keyword',
            type: 'Long-tail',
            category: 'Opportunity',
            searchVolume: '500-1k',
            competition: 'Low',
            relevance: 7,
            source: 'Web',
          },
        ],
        relatedIdeas: [],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockResponse),
      });

      const [keywords] = await fetchKeywords('test', true);

      expect(keywords[0].source).toBe('Web');
    });

    it('should handle brand name parameter', async () => {
      const mockResponse = {
        keywords: [
          {
            keyword: 'brand test keyword',
            type: 'Branded',
            category: 'Branded',
            searchVolume: '10k-20k',
            competition: 'High',
            relevance: 10,
            source: 'AI',
          },
        ],
        relatedIdeas: [],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockResponse),
      });

      const [keywords] = await fetchKeywords('test', false, 'BrandName');

      expect(keywords[0].category).toBe('Branded');
    });

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(
        new Error('API error')
      );

      await expect(fetchKeywords('test', false)).rejects.toThrow(
        'Failed to fetch keywords: API error'
      );
    });

    it('should handle empty response', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ keywords: [], relatedIdeas: [] }),
      });

      const [keywords, relatedIdeas] = await fetchKeywords('test', false);

      expect(keywords).toEqual([]);
      expect(relatedIdeas).toEqual([]);
    });
  });

  describe('fetchKeywordClusters', () => {
    it('should fetch keyword clusters successfully', async () => {
      const mockClusters = {
        'Product Features': ['wireless', 'portable', 'waterproof'],
        'Use Cases': ['outdoor', 'travel', 'party'],
        'Price Points': ['budget', 'premium', 'affordable'],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockClusters),
      });

      const mockKeywords: KeywordData[] = [
        {
          keyword: 'wireless speaker',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k',
          competition: 'High',
          relevance: 10,
          source: 'AI',
        },
      ];

      const clusters = await fetchKeywordClusters(mockKeywords);

      expect(Object.keys(clusters)).toHaveLength(3);
      expect(clusters['Product Features']).toContain('wireless');
      expect(clusters['Use Cases']).toContain('outdoor');
    });

    it('should handle JSON in code blocks for clusters', async () => {
      const mockClusters = {
        'Category 1': ['keyword1', 'keyword2'],
      };

      mockGenerateContent.mockResolvedValue({
        text: '```json\n' + JSON.stringify(mockClusters) + '\n```',
      });

      const mockKeywords: KeywordData[] = [
        {
          keyword: 'test',
          type: 'Broad',
          category: 'Core',
          searchVolume: '1k',
          competition: 'Low',
          relevance: 8,
          source: 'AI',
        },
      ];

      const clusters = await fetchKeywordClusters(mockKeywords);

      expect(clusters['Category 1']).toEqual(['keyword1', 'keyword2']);
    });

    it('should handle clustering errors', async () => {
      mockGenerateContent.mockRejectedValue(
        new Error('Clustering error')
      );

      const mockKeywords: KeywordData[] = [];

      await expect(fetchKeywordClusters(mockKeywords)).rejects.toThrow(
        'Failed to cluster keywords: Clustering error'
      );
    });
  });

  describe('fetchKeywordDeepDive', () => {
    it('should fetch keyword deep dive analysis successfully', async () => {
      const mockDeepDive: KeywordDeepDiveData = {
        adCopyAngles: [
          'Premium Quality',
          'Best Value',
          'Fast Shipping',
        ],
        bidStrategy: 'Start with $1.50 CPC and adjust based on performance',
        negativeKeywords: ['cheap', 'free', 'knockoff', 'fake', 'used'],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockDeepDive),
      });

      const result = await fetchKeywordDeepDive('bluetooth speaker');

      expect(result.adCopyAngles).toHaveLength(3);
      expect(result.adCopyAngles[0]).toBe('Premium Quality');
      expect(result.bidStrategy).toContain('$1.50');
      expect(result.negativeKeywords).toHaveLength(5);
      expect(result.negativeKeywords).toContain('cheap');
    });

    it('should handle JSON in code blocks for deep dive', async () => {
      const mockDeepDive: KeywordDeepDiveData = {
        adCopyAngles: ['Angle 1'],
        bidStrategy: 'Strategy',
        negativeKeywords: ['neg1'],
      };

      mockGenerateContent.mockResolvedValue({
        text: '```\n' + JSON.stringify(mockDeepDive) + '\n```',
      });

      const result = await fetchKeywordDeepDive('test');

      expect(result.adCopyAngles).toEqual(['Angle 1']);
      expect(result.bidStrategy).toBe('Strategy');
    });

    it('should handle deep dive errors', async () => {
      mockGenerateContent.mockRejectedValue(
        new Error('Deep dive error')
      );

      await expect(fetchKeywordDeepDive('test')).rejects.toThrow(
        'Failed to fetch keyword analysis: Deep dive error'
      );
    });

    it('should handle all fields in deep dive response', async () => {
      const mockDeepDive: KeywordDeepDiveData = {
        adCopyAngles: ['Great Quality', 'Amazing Features', 'Customer Favorite'],
        bidStrategy: 'Use dynamic bidding with a target ACoS of 25%',
        negativeKeywords: ['broken', 'defective', 'replacement', 'return'],
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockDeepDive),
      });

      const result = await fetchKeywordDeepDive('premium headphones');

      expect(result).toHaveProperty('adCopyAngles');
      expect(result).toHaveProperty('bidStrategy');
      expect(result).toHaveProperty('negativeKeywords');
      expect(Array.isArray(result.adCopyAngles)).toBe(true);
      expect(Array.isArray(result.negativeKeywords)).toBe(true);
      expect(typeof result.bidStrategy).toBe('string');
    });
  });
});
