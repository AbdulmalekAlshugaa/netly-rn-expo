/**
 * Stores the last known value during every render.
 * @param value The value to store.
 * @returns The last known value.
 */
declare const usePreviousValue: <T extends {}>(value: T) => T | undefined;
export default usePreviousValue;
