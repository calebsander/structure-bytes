import { AppendableBuffer } from './appendable';
/**
 * Throws an error if the given value is not an instance
 * of any of the provided constructors
 * @param instance The value in question
 * @param constructors A constructor or array of constructors to test against
 */
export declare function instanceOf(instance: unknown, constructors: Function | Function[]): void;
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param value The value in question
 */
export declare function integer(value: unknown): asserts value is number;
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
 * Throws an error if the given value is not zero or a positive integer
 * @param value The value in question
 */
export declare function nonNegativeInteger(value: unknown): asserts value is number;
/**
 * Requires that the buffer be a [[GrowableBuffer]]
 * or [[AppendableStream]]
 * @private
 * @param buffer The value to assert is an [[AppendableBuffer]]
 */
export declare function isBuffer(value: unknown): asserts value is AppendableBuffer;
/** Equality comparisons */
export declare const equal: {
    /** Compares two `ArrayBuffer`s and returns whether they are equal */
    buffers(actual: ArrayBuffer, expected: ArrayBuffer): boolean;
};
