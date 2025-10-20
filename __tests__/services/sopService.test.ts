import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reinitializeSOPService } from '../../services/sopService';

// Mock the GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn(),
  })),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('sopService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('reinitializeSOPService', () => {
    it('should be exported and callable', () => {
      expect(reinitializeSOPService).toBeDefined();
      expect(typeof reinitializeSOPService).toBe('function');
      
      // Should not throw when called
      expect(() => reinitializeSOPService()).not.toThrow();
    });

    it('should reinitialize service when API key is in localStorage', () => {
      // Set up a mock API key
      localStorageMock.setItem('ppcGeniusApiSettings.geminiApiKey', 'test-api-key');
      
      // Should not throw
      expect(() => reinitializeSOPService()).not.toThrow();
    });

    it('should handle reinitialization with no API key', () => {
      // Ensure no API key is set
      localStorageMock.clear();
      
      // Should not throw even without API key
      expect(() => reinitializeSOPService()).not.toThrow();
    });
  });
});
