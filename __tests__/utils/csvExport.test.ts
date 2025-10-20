import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { escapeCSVField, arrayToCSV, downloadCSV, exportObjectsToCSV } from '../../utils/csvExport';

describe('csvExport utilities', () => {
  describe('escapeCSVField', () => {
    it('should return empty string for null or undefined', () => {
      expect(escapeCSVField(null)).toBe('');
      expect(escapeCSVField(undefined)).toBe('');
    });

    it('should convert numbers and booleans to strings', () => {
      expect(escapeCSVField(123)).toBe('123');
      expect(escapeCSVField(true)).toBe('true');
      expect(escapeCSVField(false)).toBe('false');
    });

    it('should not escape simple strings', () => {
      expect(escapeCSVField('hello')).toBe('hello');
      expect(escapeCSVField('hello world')).toBe('hello world');
    });

    it('should escape strings with commas', () => {
      expect(escapeCSVField('hello, world')).toBe('"hello, world"');
    });

    it('should escape strings with quotes', () => {
      expect(escapeCSVField('say "hello"')).toBe('"say ""hello"""');
    });

    it('should escape strings with newlines', () => {
      expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"');
    });

    it('should escape strings with multiple special characters', () => {
      expect(escapeCSVField('hello, "world"\nnew line')).toBe('"hello, ""world""\nnew line"');
    });
  });

  describe('arrayToCSV', () => {
    it('should convert array of arrays to CSV', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['John', 30, 'New York'],
        ['Jane', 25, 'Boston']
      ];
      const expected = 'Name,Age,City\nJohn,30,New York\nJane,25,Boston';
      expect(arrayToCSV(data)).toBe(expected);
    });

    it('should handle empty arrays', () => {
      expect(arrayToCSV([])).toBe('');
      expect(arrayToCSV([[]])).toBe('');
    });

    it('should escape fields with special characters', () => {
      const data = [
        ['Name', 'Description'],
        ['Product A', 'High-quality, durable'],
        ['Product B', 'Say "wow"']
      ];
      const expected = 'Name,Description\nProduct A,"High-quality, durable"\nProduct B,"Say ""wow"""';
      expect(arrayToCSV(data)).toBe(expected);
    });

    it('should handle null and undefined values', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['John', null, undefined]
      ];
      const expected = 'Name,Age,City\nJohn,,';
      expect(arrayToCSV(data)).toBe(expected);
    });
  });

  describe('downloadCSV', () => {
    let createObjectURLSpy: ReturnType<typeof vi.fn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.fn>;
    let createElementSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      createObjectURLSpy = vi.fn(() => 'blob:mock-url');
      revokeObjectURLSpy = vi.fn();
      global.URL.createObjectURL = createObjectURLSpy;
      global.URL.revokeObjectURL = revokeObjectURLSpy;

      // Mock document.createElement for anchor element
      clickSpy = vi.fn();
      createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const mockAnchor = {
            href: '',
            download: '',
            style: { display: '' },
            click: clickSpy,
          } as any;
          return mockAnchor;
        }
        return document.createElement(tagName);
      });

      // Mock appendChild and removeChild
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a CSV file with UTF-8 BOM by default', () => {
      const csvContent = 'Name,Age\nJohn,30';
      const filename = 'test.csv';

      downloadCSV(csvContent, filename);

      // Check that Blob was created with BOM
      expect(createObjectURLSpy).toHaveBeenCalled();
      const blobArg = createObjectURLSpy.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');

      // Check that anchor was created and clicked
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should create a CSV file without BOM when specified', () => {
      const csvContent = 'Name,Age\nJohn,30';
      const filename = 'test.csv';

      downloadCSV(csvContent, filename, false);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should set correct filename', () => {
      const csvContent = 'Name,Age\nJohn,30';
      const filename = 'my-data.csv';

      const mockAnchor = {} as any;
      createElementSpy.mockImplementation((tagName) => {
        if (tagName === 'a') {
          mockAnchor.click = clickSpy;
          mockAnchor.style = { display: '' };
          return mockAnchor;
        }
        return document.createElement(tagName);
      });

      downloadCSV(csvContent, filename);

      expect(mockAnchor.download).toBe(filename);
    });
  });

  describe('exportObjectsToCSV', () => {
    it('should handle empty data array', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      exportObjectsToCSV([], 'test.csv');

      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      consoleSpy.mockRestore();
    });
  });
});
