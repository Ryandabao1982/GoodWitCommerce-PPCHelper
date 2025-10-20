import { describe, it, expect } from 'vitest';
import { splitSeedKeywords } from '../../utils/keywordParsing';

describe('splitSeedKeywords', () => {
  it('splits comma-separated values regardless of spacing', () => {
    expect(splitSeedKeywords('apple, banana,carrot')).toEqual(['apple', 'banana', 'carrot']);
  });

  it('splits on multiple newlines and removes empty entries', () => {
    expect(splitSeedKeywords('alpha\n\nbeta\ngamma\n\n')).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('handles mixed commas and newlines with extra whitespace', () => {
    expect(splitSeedKeywords('one, two\nthree,,\n  four \n\n five')).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ]);
  });

  it('handles Windows-style newlines and carriage returns', () => {
    expect(splitSeedKeywords('alpha\r\nbeta\r\n\r\ngamma')).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });
});
