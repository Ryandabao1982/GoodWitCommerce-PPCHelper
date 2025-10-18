import { describe, it, expect } from 'vitest';
import { parseSearchVolume, sortByVolume } from '../../utils/sorting';

describe('sorting utilities', () => {
  describe('parseSearchVolume', () => {
    it('should parse numeric values without multipliers', () => {
      expect(parseSearchVolume('100')).toBe(100);
      expect(parseSearchVolume('500')).toBe(500);
      expect(parseSearchVolume('1234')).toBe(1234);
    });

    it('should parse values with k multiplier (thousands)', () => {
      expect(parseSearchVolume('1k')).toBe(1000);
      expect(parseSearchVolume('10k')).toBe(10000);
      expect(parseSearchVolume('2.5k')).toBe(2500);
      expect(parseSearchVolume('100k')).toBe(100000);
    });

    it('should parse values with K multiplier (uppercase)', () => {
      expect(parseSearchVolume('1K')).toBe(1000);
      expect(parseSearchVolume('50K')).toBe(50000);
    });

    it('should parse values with m multiplier (millions)', () => {
      expect(parseSearchVolume('1m')).toBe(1000000);
      expect(parseSearchVolume('2.5m')).toBe(2500000);
      expect(parseSearchVolume('10m')).toBe(10000000);
    });

    it('should parse values with M multiplier (uppercase)', () => {
      expect(parseSearchVolume('1M')).toBe(1000000);
      expect(parseSearchVolume('5M')).toBe(5000000);
    });

    it('should handle decimal values', () => {
      expect(parseSearchVolume('1.5')).toBe(1.5);
      expect(parseSearchVolume('3.14')).toBe(3.14);
      expect(parseSearchVolume('0.5k')).toBe(500);
    });

    it('should handle ranges by taking the first number', () => {
      expect(parseSearchVolume('10k-20k')).toBe(10000);
      expect(parseSearchVolume('100-500')).toBe(100);
      expect(parseSearchVolume('1k-5k')).toBe(1000);
    });

    it('should return 0 for empty or N/A values', () => {
      expect(parseSearchVolume('')).toBe(0);
      expect(parseSearchVolume('N/A')).toBe(0);
    });

    it('should return 0 for invalid formats', () => {
      expect(parseSearchVolume('invalid')).toBe(0);
      expect(parseSearchVolume('abc')).toBe(0);
      expect(parseSearchVolume('--')).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(parseSearchVolume('0')).toBe(0);
      expect(parseSearchVolume('0k')).toBe(0);
      expect(parseSearchVolume('0m')).toBe(0);
    });
  });

  describe('sortByVolume', () => {
    it('should sort in descending order by default', () => {
      // In descending order: higher values should come first (negative result)
      const result = sortByVolume('10k', '1k');
      expect(result).toBeLessThan(0); // 10k comes before 1k in descending
      
      const result2 = sortByVolume('1k', '10k');
      expect(result2).toBeGreaterThan(0); // 1k comes after 10k in descending
    });

    it('should sort in ascending order when specified', () => {
      const result = sortByVolume('1k', '10k', true);
      expect(result).toBeLessThan(0);
      
      const result2 = sortByVolume('10k', '1k', true);
      expect(result2).toBeGreaterThan(0);
    });

    it('should handle equal values', () => {
      expect(sortByVolume('5k', '5k')).toBe(0);
      expect(sortByVolume('5k', '5k', true)).toBe(0);
      expect(sortByVolume('1000', '1k')).toBe(0);
    });

    it('should sort with mixed formats', () => {
      const volumes = ['100', '1k', '500', '2k', '50'];
      const sorted = [...volumes].sort((a, b) => sortByVolume(a, b));
      expect(sorted).toEqual(['2k', '1k', '500', '100', '50']);
    });

    it('should sort ascending with mixed formats', () => {
      const volumes = ['100', '1k', '500', '2k', '50'];
      const sorted = [...volumes].sort((a, b) => sortByVolume(a, b, true));
      expect(sorted).toEqual(['50', '100', '500', '1k', '2k']);
    });

    it('should handle N/A and empty values', () => {
      const volumes = ['10k', 'N/A', '5k', '', '1k'];
      const sorted = [...volumes].sort((a, b) => sortByVolume(a, b));
      expect(sorted[0]).toBe('10k');
      expect(sorted[1]).toBe('5k');
      expect(sorted[2]).toBe('1k');
      // N/A and empty should be at the end (both parse to 0)
    });

    it('should handle ranges correctly', () => {
      // Descending order: higher values first (negative result)
      const result = sortByVolume('10k-20k', '5k-10k');
      expect(result).toBeLessThan(0); // 10k comes before 5k in descending
      
      const result2 = sortByVolume('1k-2k', '5k-10k');
      expect(result2).toBeGreaterThan(0); // 1k comes after 5k in descending
    });

    it('should work with millions and thousands', () => {
      const volumes = ['1m', '500k', '100k', '1k'];
      const sorted = [...volumes].sort((a, b) => sortByVolume(a, b));
      expect(sorted).toEqual(['1m', '500k', '100k', '1k']);
    });

    it('should handle decimal values in sorting', () => {
      const volumes = ['1.5k', '1.2k', '1.8k', '1k'];
      const sorted = [...volumes].sort((a, b) => sortByVolume(a, b));
      expect(sorted).toEqual(['1.8k', '1.5k', '1.2k', '1k']);
    });
  });
});
