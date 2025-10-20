/**
 * Tests for Keyword Normalization Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeKeyword,
  stemKeyword,
  calculateSimilarity,
  findDuplicates,
  keywordExists,
  parseKeywordInput,
  validateKeywordInput,
  cleanKeywords,
} from '../../utils/keywordNormalizer';
import type { KeywordDataExtended } from '../../types';

describe('keywordNormalizer', () => {
  describe('normalizeKeyword', () => {
    it('should convert to lowercase', () => {
      expect(normalizeKeyword('WIRELESS HEADPHONES')).toBe('wireless headphones');
    });

    it('should trim whitespace', () => {
      expect(normalizeKeyword('  wireless headphones  ')).toBe('wireless headphones');
    });

    it('should remove extra spaces', () => {
      expect(normalizeKeyword('wireless  headphones')).toBe('wireless headphones');
    });

    it('should remove special characters', () => {
      expect(normalizeKeyword('wireless@headphones!')).toBe('wirelessheadphones');
    });

    it('should keep hyphens', () => {
      expect(normalizeKeyword('noise-canceling')).toBe('noise-canceling');
    });
  });

  describe('stemKeyword', () => {
    it('should remove plural s', () => {
      expect(stemKeyword('bottles')).toBe('bottle');
      expect(stemKeyword('headphones')).toBe('headphone');
    });

    it('should not remove s from short words', () => {
      expect(stemKeyword('gas')).toBe('gas');
    });

    it('should not remove double s', () => {
      expect(stemKeyword('glass')).toBe('glass');
    });

    it('should remove ing', () => {
      expect(stemKeyword('running')).toBe('runn');
    });

    it('should remove ed', () => {
      expect(stemKeyword('tested')).toBe('test');
    });

    it('should remove ly', () => {
      expect(stemKeyword('quickly')).toBe('quick');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical keywords', () => {
      expect(calculateSimilarity('wireless headphones', 'wireless headphones')).toBe(1);
    });

    it('should return high similarity for minor differences', () => {
      const similarity = calculateSimilarity('wireless headphones', 'wireless headphone');
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should return low similarity for different keywords', () => {
      const similarity = calculateSimilarity('wireless headphones', 'laptop computer');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should be case-insensitive', () => {
      expect(calculateSimilarity('Wireless Headphones', 'wireless headphones')).toBe(1);
    });
  });

  describe('findDuplicates', () => {
    it('should find exact duplicates', () => {
      const keywords: KeywordDataExtended[] = [
        {
          id: '1',
          keyword: 'wireless headphones',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
        {
          id: '2',
          keyword: 'wireless headphones',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
      ];

      const duplicates = findDuplicates(keywords);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchType).toBe('exact');
    });

    it('should find variant duplicates', () => {
      const keywords: KeywordDataExtended[] = [
        {
          id: '1',
          keyword: 'bottle',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
        {
          id: '2',
          keyword: 'bottles',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
      ];

      const duplicates = findDuplicates(keywords);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchType).toBe('variant');
    });

    it('should not find duplicates below threshold', () => {
      const keywords: KeywordDataExtended[] = [
        {
          id: '1',
          keyword: 'wireless headphones',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
        {
          id: '2',
          keyword: 'bluetooth speaker',
          type: 'Broad',
          category: 'Core',
          searchVolume: '10k-20k',
          competition: 'Medium',
          relevance: 8,
          source: 'AI',
        },
      ];

      const duplicates = findDuplicates(keywords, 0.9);
      expect(duplicates.length).toBe(0);
    });
  });

  describe('keywordExists', () => {
    const existingKeywords: KeywordDataExtended[] = [
      {
        id: '1',
        keyword: 'wireless headphones',
        type: 'Broad',
        category: 'Core',
        searchVolume: '10k-20k',
        competition: 'Medium',
        relevance: 8,
        source: 'AI',
      },
    ];

    it('should find existing keyword', () => {
      expect(keywordExists('wireless headphones', existingKeywords)).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(keywordExists('WIRELESS HEADPHONES', existingKeywords)).toBe(true);
    });

    it('should not find non-existing keyword', () => {
      expect(keywordExists('bluetooth speaker', existingKeywords)).toBe(false);
    });
  });

  describe('parseKeywordInput', () => {
    it('should parse plain text', () => {
      const input = 'wireless headphones\nbluetooth speaker\nnoise canceling';
      const keywords = parseKeywordInput(input);
      expect(keywords).toEqual(['wireless headphones', 'bluetooth speaker', 'noise canceling']);
    });

    it('should parse CSV', () => {
      const input = 'wireless headphones,10000,high\nbluetooth speaker,5000,medium';
      const keywords = parseKeywordInput(input);
      expect(keywords).toEqual(['wireless headphones', 'bluetooth speaker']);
    });

    it('should skip header row in CSV', () => {
      const input = 'Keyword,Volume,Competition\nwireless headphones,10000,high';
      const keywords = parseKeywordInput(input);
      expect(keywords).toEqual(['wireless headphones']);
    });

    it('should handle empty lines', () => {
      const input = 'wireless headphones\n\nbluetooth speaker\n';
      const keywords = parseKeywordInput(input);
      expect(keywords).toEqual(['wireless headphones', 'bluetooth speaker']);
    });
  });

  describe('validateKeywordInput', () => {
    it('should validate correct keywords', () => {
      const keywords = ['wireless headphones', 'bluetooth speaker'];
      const errors = validateKeywordInput(keywords);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty input', () => {
      const keywords: string[] = [];
      const errors = validateKeywordInput(keywords);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject too many keywords', () => {
      const keywords = Array(1001).fill('test keyword');
      const errors = validateKeywordInput(keywords);
      expect(errors.some((e) => e.includes('Too many'))).toBe(true);
    });

    it('should reject keywords that are too long', () => {
      const keywords = ['a'.repeat(201)];
      const errors = validateKeywordInput(keywords);
      expect(errors.some((e) => e.includes('too long'))).toBe(true);
    });

    it('should reject keywords with invalid characters', () => {
      const keywords = ['test@keyword!'];
      const errors = validateKeywordInput(keywords);
      expect(errors.some((e) => e.includes('Invalid characters'))).toBe(true);
    });
  });

  describe('cleanKeywords', () => {
    it('should remove empty keywords', () => {
      const keywords = ['wireless headphones', '', 'bluetooth speaker'];
      const cleaned = cleanKeywords(keywords);
      expect(cleaned).toEqual(['wireless headphones', 'bluetooth speaker']);
    });

    it('should trim whitespace', () => {
      const keywords = ['  wireless headphones  ', 'bluetooth speaker  '];
      const cleaned = cleanKeywords(keywords);
      expect(cleaned).toEqual(['wireless headphones', 'bluetooth speaker']);
    });

    it('should remove exact duplicates', () => {
      const keywords = ['wireless headphones', 'wireless headphones', 'bluetooth speaker'];
      const cleaned = cleanKeywords(keywords);
      expect(cleaned).toEqual(['wireless headphones', 'bluetooth speaker']);
    });
  });
});
