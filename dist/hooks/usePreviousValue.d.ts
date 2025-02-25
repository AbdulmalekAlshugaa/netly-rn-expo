/**
 * Stores the last known value during every render.
 *
 * @param value Primitive variable to be stored as the "previous value" upon the next render.
 * @returns The last known value.
 */
declare const usePreviousValue: <T extends {}>(value: T) => T | undefined;
export default usePreviousValue;
