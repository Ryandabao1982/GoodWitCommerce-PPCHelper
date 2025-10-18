/**
 * Safely saves a value to localStorage by key.
 * @param key The key to save the value under.
 * @param value The value to save (will be JSON.stringified).
 */
export const saveToLocalStorage = (key: string, value: unknown): void => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error saving to localStorage for key "${key}":`, error);
    }
};

/**
 * Safely loads a value from localStorage by key.
 * @param key The key to load the value from.
 * @param defaultValue The default value to return if the key is not found or parsing fails.
 * @returns The parsed value from localStorage or the default value.
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return defaultValue;
        }
        return JSON.parse(serializedValue) as T;
    } catch (error) {
        console.error(`Error loading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};
