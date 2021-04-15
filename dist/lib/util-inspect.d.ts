/**
 * Converts a byte to a 2-digit hexadecimal string
 * @param n The byte value
 * @return `n` with a possible leading 0
 */
export declare const hexByte: (n: number) => string;
/**
 * A simple replacement for `util.inspect()`.
 * Makes little effort at readability.
 * Useful for generating more detailed
 * error messages, and so that the client-side
 * code doesn't need to pack `util` as a dependency.
 * @param obj The value to inspect
 * @return A string expressing the given value
 */
export declare const inspect: (obj: unknown) => string;
