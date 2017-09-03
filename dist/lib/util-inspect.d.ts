/**
 * A simple replacement for `util.inspect()`.
 * Makes little effort at readability,
 * and cannot handle circular values.
 * Useful for generating more detailed
 * error messages, and so that the client-side
 * code doesn't need to pack `util` as a dependency.
 * @param obj The value to inspect
 * @return A string expressing the given value
 */
export declare function inspect(obj: any): string;
