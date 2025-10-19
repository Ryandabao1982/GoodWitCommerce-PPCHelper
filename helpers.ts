/**
 * Creates a deep clone of an object using JSON serialization.
 * This is a simple way to deep clone, but it has limitations (e.g., loses functions, undefined, etc.).
 * It's suitable for plain data objects like those used in this app's state.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
export function safeDeepClone<T>(obj: T): T {
    try {
        // The `as T` is a safe assertion here because we are immediately parsing
        // the stringified version of the same type.
        return JSON.parse(JSON.stringify(obj)) as T;
    } catch (error) {
        console.error('Error cloning object:', error);
        throw new Error('Failed to deep clone object. Check for circular references or non-serializable values.');
    }
}
