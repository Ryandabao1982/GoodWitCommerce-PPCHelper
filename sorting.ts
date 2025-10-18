import type { KeywordData, CompetitionLevel } from '../types';

/**
 * Parses a search volume string (e.g., '10k', '5000-7000') into a number for sorting.
 * @param volume The search volume string.
 * @param getAverage If true and volume is a range, returns the average. Otherwise, returns the lower bound.
 * @returns A numeric representation of the search volume.
 */
export const parseSearchVolume = (volume: string, getAverage = false): number => {
    if (!volume) return 0;
    const cleaned = String(volume).replace(/[~+,]/g, '').toLowerCase();
    const parseValue = (valStr: string): number => {
        let num = parseFloat(valStr);
        if (valStr.includes('k')) num *= 1000;
        return isNaN(num) ? 0 : num;
    };
    if (cleaned.includes('-')) {
        const [min, max] = cleaned.split('-').map(parseValue);
        return getAverage ? (min + max) / 2 : min;
    }
    return parseValue(cleaned);
};

/**
 * Sorts an array of KeywordData based on a given sort configuration.
 * @param keywords The array of keywords to sort.
 * @param sortConfig The key and direction to sort by.
 * @returns A new array of sorted keywords.
 */
export const sortKeywords = (
    keywords: KeywordData[],
    sortConfig: { key: keyof KeywordData | null; direction: 'ascending' | 'descending' }
): KeywordData[] => {
    let sortableItems = [...keywords];
    if (!sortConfig.key) return sortableItems;
    
    sortableItems.sort((a, b) => {
        const key = sortConfig.key!;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        if (key === 'competition') {
            const order: Record<CompetitionLevel, number> = { 'Low': 1, 'Medium': 2, 'High': 3 };
            return (order[a.competition] - order[b.competition]) * direction;
        }

        if (key === 'searchVolume') {
            return (parseSearchVolume(a.searchVolume) - parseSearchVolume(b.searchVolume)) * direction;
        }

        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * direction;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * direction;
        }

        return 0;
    });

    return sortableItems;
};