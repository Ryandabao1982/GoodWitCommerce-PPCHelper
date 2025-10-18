export function parseSearchVolume(volume: string): number {
  if (!volume || volume === 'N/A') return 0;
  
  // Handle ranges like "10k-20k", "100-500", etc.
  const match = volume.match(/(\d+\.?\d*)([kKmM]?)/);
  if (!match) return 0;
  
  let num = parseFloat(match[1]);
  const multiplier = match[2].toLowerCase();
  
  if (multiplier === 'k') num *= 1000;
  if (multiplier === 'm') num *= 1000000;
  
  return num;
}

export function sortByVolume(a: string, b: string, ascending: boolean = false): number {
  const volA = parseSearchVolume(a);
  const volB = parseSearchVolume(b);
  return ascending ? volA - volB : volB - volA;
}
