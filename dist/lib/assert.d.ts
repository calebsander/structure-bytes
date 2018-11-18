/**
 * Throws an error if the given value is not an instance
 * of any of the provided constructors
 * @param instance The value in question
 * @param constructors A constructor or array of constructors to test against
 */
export declare function instanceOf(instance: any, constructors: Function | Function[]): void;
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param instance The value in question
 */
export declare function integer(instance: any): void;
/**
 * Throws an error if a numeric value is not between
 * the given bounds
 * @param lower The lower bound (inclusive)
 * @param value The value in question
 * @param upper The upper bound (exclusive)
 * @param message An optional message to include in the error message
 */
export declare function between(lower: number, value: number, upper: number, message?: string): void;
/**
 * Throws an error if the given value is not an integer
 * and in the range that can be represented in an unsigned byte
 * @param value The value in question
 */
export declare function byteUnsignedInteger(value: any): void;
/** Equality comparisons */
export declare const equal: {
    /** Compares two `ArrayBuffer`s and returns whether they are equal */
    buffers(actual: ArrayBuffer, expected: ArrayBuffer): boolean;
};
