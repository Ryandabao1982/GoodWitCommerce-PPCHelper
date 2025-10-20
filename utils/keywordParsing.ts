export function splitSeedKeywords(input: string): string[] {
  return input
    .split(/[\r\n,]+/)
    .map(keyword => keyword.trim())
    .filter(Boolean);
}
