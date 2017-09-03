import GrowableBuffer from './growable-buffer';
/**
 * Increments the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to increment
 */
export declare function increment(buffer: GrowableBuffer): void;
/**
 * Decrements the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to decrement
 */
export declare function decrement(buffer: GrowableBuffer): void;
/**
 * Gets the current number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to get
 * @return The number of [[increment]]s minus
 * the number of [[decrement]]s called on the buffer
 */
export declare function get(buffer: GrowableBuffer): number | undefined;
