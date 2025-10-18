import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadFromLocalStorage', () => {
    it('should return default value when key does not exist', () => {
      const result = loadFromLocalStorage('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return stored value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify('storedValue'));
      const result = loadFromLocalStorage('testKey', 'default');
      expect(result).toBe('storedValue');
    });

    it('should handle complex objects', () => {
      const obj = { name: 'test', count: 42, nested: { value: true } };
      localStorage.setItem('testObj', JSON.stringify(obj));
      const result = loadFromLocalStorage('testObj', {});
      expect(result).toEqual(obj);
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      localStorage.setItem('testArr', JSON.stringify(arr));
      const result = loadFromLocalStorage('testArr', []);
      expect(result).toEqual(arr);
    });

    it('should return default value on parse error', () => {
      localStorage.setItem('invalidJson', 'not valid json {]');
      const result = loadFromLocalStorage('invalidJson', 'default');
      expect(result).toBe('default');
    });

    it('should handle null values', () => {
      localStorage.setItem('nullValue', JSON.stringify(null));
      const result = loadFromLocalStorage('nullValue', 'default');
      expect(result).toBeNull();
    });

    it('should handle boolean values', () => {
      localStorage.setItem('boolTrue', JSON.stringify(true));
      localStorage.setItem('boolFalse', JSON.stringify(false));
      expect(loadFromLocalStorage('boolTrue', false)).toBe(true);
      expect(loadFromLocalStorage('boolFalse', true)).toBe(false);
    });

    it('should handle numeric values', () => {
      localStorage.setItem('number', JSON.stringify(123));
      const result = loadFromLocalStorage('number', 0);
      expect(result).toBe(123);
    });
  });

  describe('saveToLocalStorage', () => {
    it('should save string values', () => {
      saveToLocalStorage('testKey', 'testValue');
      const stored = localStorage.getItem('testKey');
      expect(stored).toBe(JSON.stringify('testValue'));
    });

    it('should save object values', () => {
      const obj = { name: 'test', value: 123 };
      saveToLocalStorage('testObj', obj);
      const stored = localStorage.getItem('testObj');
      expect(JSON.parse(stored!)).toEqual(obj);
    });

    it('should save array values', () => {
      const arr = ['a', 'b', 'c'];
      saveToLocalStorage('testArr', arr);
      const stored = localStorage.getItem('testArr');
      expect(JSON.parse(stored!)).toEqual(arr);
    });

    it('should save boolean values', () => {
      saveToLocalStorage('boolValue', true);
      const stored = localStorage.getItem('boolValue');
      expect(JSON.parse(stored!)).toBe(true);
    });

    it('should save null values', () => {
      saveToLocalStorage('nullValue', null);
      const stored = localStorage.getItem('nullValue');
      expect(JSON.parse(stored!)).toBeNull();
    });

    it('should save numeric values', () => {
      saveToLocalStorage('number', 456);
      const stored = localStorage.getItem('number');
      expect(JSON.parse(stored!)).toBe(456);
    });

    it('should overwrite existing values', () => {
      saveToLocalStorage('key', 'first');
      saveToLocalStorage('key', 'second');
      const result = loadFromLocalStorage('key', '');
      expect(result).toBe('second');
    });

    it('should handle complex nested structures', () => {
      const complex = {
        brands: ['Brand A', 'Brand B'],
        settings: {
          darkMode: true,
          advanced: {
            minVolume: '1000',
            maxVolume: '10000',
          },
        },
      };
      saveToLocalStorage('complex', complex);
      const result = loadFromLocalStorage('complex', {});
      expect(result).toEqual(complex);
    });
  });

  describe('integration tests', () => {
    it('should correctly save and load the same value', () => {
      const data = { test: 'data', count: 42 };
      saveToLocalStorage('integration', data);
      const loaded = loadFromLocalStorage('integration', {});
      expect(loaded).toEqual(data);
    });

    it('should handle multiple keys independently', () => {
      saveToLocalStorage('key1', 'value1');
      saveToLocalStorage('key2', 'value2');
      saveToLocalStorage('key3', 'value3');
      
      expect(loadFromLocalStorage('key1', '')).toBe('value1');
      expect(loadFromLocalStorage('key2', '')).toBe('value2');
      expect(loadFromLocalStorage('key3', '')).toBe('value3');
    });
  });
});
