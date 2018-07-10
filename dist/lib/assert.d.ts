/**
 * Throws an error if the given value is not an instance
 * of any of the provided constructors
 * @param instance The value in question
 * @param constructors A constructor or array of constructors to test against
 */
declare function instanceOf(instance: any, constructors: Function | Function[]): void;
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param instance The value in question
 */
declare function integer(instance: any): void;
/**
 * Throws an error if a numeric value is not between
 * the given bounds
 * @param lower The lower bound (inclusive)
 * @param value The value in question
 * @param upper The upper bound (exclusive)
 * @param message An optional message to include in the error message
 */
declare function between(lower: number, value: number, upper: number, message?: string): void;
/**
 * Throws an error if the given value is not an integer
 * and in the range that can be represented in an unsigned byte
 * @param value The value in question
 */
declare function byteUnsignedInteger(value: any): void;
/**
 * Throws an error with the specified message
 * @param message The message of the thrown error
 */
declare function fail(message: string): never;
/**
 * Throws an error if the provided condition is false,
 * using the given error message.
 * This function is exported by this module.
 */
declare function assert(condition: boolean, message?: string): void;
/**
 * Throws an error if the given function does not throw
 * an error when executed.
 * Can also provide a message string given to [[errorMessage]].
 * @param block A function that should throw an error
 * @param message The optional message string to match against
 */
declare function throws(block: () => void, message?: string): void;
/**
 * Throws an error if the provided values are not "equal".
 * This has different meanings for different types of expected values:
 * - If `expected` is an `Object`,
 * `actual[key]` should "equal" `expected[key]` for each `key` in `expected`
 * - If `expected` is an `Array`, the lengths should match
 * and corresponding elements should be "equal"
 * - If `expected` is a `Map`, the sizes should match and iterating
 * should yield "equal" corresponding keys and values
 * - If `expected` is a `Set`, `Array.from(actual)` should "equal" `Array.from(expected)`
 * - If `expected` is an `ArrayBuffer`, the lengths should match and corresponding
 * bytes should be "equal"
 * - If `expected` is a `Function`, the names should be equal
 * - If `expected` has an `equals()` method, that is used
 * - Otherwise, `===` is used
 * @param actual
 * @param expected
 */
declare function equal(actual: any, expected: any): void;
/**
 * Throws an error if the given value is not an error
 * or its message doesn't start with the given message string
 * @param err The error value to test
 * @param message The string that the error message should start with
 */
declare function errorMessage(err: Error | null, message: string): void;
declare const _default: typeof assert & {
    instanceOf: typeof instanceOf;
    integer: typeof integer;
    between: typeof between;
    byteUnsignedInteger: typeof byteUnsignedInteger;
    fail: typeof fail;
    throws: typeof throws;
    equal: typeof equal;
    errorMessage: typeof errorMessage;
};
export default _default;
