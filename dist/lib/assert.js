"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_inspect_1 = require("./util-inspect");
//A number of useful assertion functions
//Used in tests and for validations in production
/**
 * Throws an error if the given value is not an instance
 * of any of the provided constructors
 * @param instance The value in question
 * @param constructors A constructor or array of constructors to test against
 */
function instanceOf(instance, constructors) {
    if (!(constructors instanceof Array))
        constructors = [constructors];
    for (const constructor of constructors) {
        if (instance instanceof constructor ||
            (!(instance === undefined || instance === null) && instance.constructor === constructor) //necessary for primitives
        )
            return;
    }
    throw new TypeError(util_inspect_1.inspect(instance) +
        ' is not an instance of ' +
        constructors
            .map(({ name }) => name)
            .join(' or '));
}
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param instance The value in question
 */
function integer(instance) {
    instanceOf(instance, Number);
    if (!Number.isSafeInteger(instance)) {
        throw new RangeError(util_inspect_1.inspect(instance) + ' is not an integer');
    }
}
/**
 * Throws an error if a numeric value is not between
 * the given bounds
 * @param lower The lower bound (inclusive)
 * @param value The value in question
 * @param upper The upper bound (exclusive)
 * @param message An optional message to include in the error message
 */
function between(lower, value, upper, message) {
    if (value < lower || value >= upper) {
        const outOfBoundsMessage = String(value) +
            ' is not in [' +
            String(lower) +
            ',' +
            String(upper) +
            ')';
        if (message)
            throw new RangeError(message + ' (' + outOfBoundsMessage + ')');
        else
            throw new RangeError(outOfBoundsMessage);
    }
}
/**
 * Throws an error if the given value is not an integer
 * and in the range that can be represented in an unsigned byte
 * @param value The value in question
 */
function byteUnsignedInteger(value) {
    integer(value);
    between(0, value, 256);
}
/**
 * Throws an error with the specified message
 * @param message The message of the thrown error
 */
function fail(message) {
    throw new Error(message);
}
/**
 * Throws an error if the provided condition is false,
 * using the given error message.
 * This function is exported by this module.
 */
function assert(condition, message) {
    if (!condition)
        fail(message || 'Assertion failed');
}
/**
 * Throws an error if the given function does not throw
 * an error when executed.
 * Can also provide a message string given to [[errorMessage]].
 * @param block A function that should throw an error
 * @param message The optional message string to match against
 */
function throws(block, message) {
    let success = true;
    try {
        block();
        success = false;
    }
    catch (e) {
        if (message)
            errorMessage(e, message);
    }
    assert(success, message ? 'Was expecting error: ' + message : 'Should throw an error');
}
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
function equal(actual, expected) {
    const error = () => new RangeError('Expected ' + util_inspect_1.inspect(expected) + ' but got ' + util_inspect_1.inspect(actual));
    if (expected) {
        let matchedSpecialCase = true;
        switch (expected.constructor) {
            case Object: {
                if (!(actual && actual.constructor === Object))
                    throw error();
                for (const key in expected) {
                    /*istanbul ignore else*/
                    if ({}.hasOwnProperty.call(expected, key)) {
                        try {
                            equal(actual[key], expected[key]);
                        }
                        catch (e) {
                            throw error();
                        }
                    }
                }
                break;
            }
            case Array: {
                if (!(actual && actual.constructor === Array))
                    throw error();
                try {
                    equal(actual.length, expected.length);
                }
                catch (e) {
                    throw error();
                }
                for (let i = 0; i < expected.length; i++) {
                    try {
                        equal(actual[i], expected[i]);
                    }
                    catch (e) {
                        throw error();
                    }
                }
                break;
            }
            case Map: {
                if (!(actual && actual.constructor === Map))
                    throw error();
                try {
                    equal(actual.size, expected.size);
                }
                catch (e) {
                    throw error();
                }
                const expectedIterator = expected.entries();
                const actualIterator = actual.entries();
                let entry;
                while (!(entry = expectedIterator.next()).done) {
                    try {
                        equal(entry.value, actualIterator.next().value);
                    }
                    catch (e) {
                        throw error();
                    }
                }
                break;
            }
            case Set: {
                if (!(actual && actual.constructor === Set))
                    throw error();
                try {
                    equal(actual.size, expected.size);
                }
                catch (e) {
                    throw error();
                }
                const expectedIterator = expected.values();
                const actualIterator = actual.values();
                let entry;
                while (!(entry = expectedIterator.next()).done) {
                    try {
                        equal(entry.value, actualIterator.next().value);
                    }
                    catch (e) {
                        throw error();
                    }
                }
                break;
            }
            case ArrayBuffer: {
                if (!(actual && actual.constructor === ArrayBuffer))
                    throw error();
                try {
                    equal(actual.byteLength, expected.byteLength);
                }
                catch (e) {
                    throw error();
                }
                const castActual = new Uint8Array(actual);
                const castExpected = new Uint8Array(expected);
                try {
                    for (let i = 0; i < castExpected.length; i++)
                        equal(castActual[i], castExpected[i]);
                }
                catch (e) {
                    throw error();
                }
                break;
            }
            case Function: {
                if (!(actual && actual.constructor === Function))
                    throw error();
                try {
                    equal(actual.name, expected.name);
                }
                catch (e) {
                    throw error();
                }
                break;
            }
            default: {
                matchedSpecialCase = false;
            }
        }
        if (matchedSpecialCase)
            return;
    }
    if (!(expected === undefined || expected === null) && expected.equals instanceof Function) {
        let equals;
        try {
            equals = expected.equals(actual);
        }
        catch (e) {
            throw new Error('equals() is not implemented for ' + util_inspect_1.inspect(expected));
        }
        if (!equals)
            throw error();
    }
    else {
        if (expected !== actual)
            throw error();
    }
}
/**
 * Throws an error if the given value is not an error
 * or its message doesn't start with the given message string
 * @param err The error value to test
 * @param message The string that the error message should start with
 */
function errorMessage(err, message) {
    instanceOf(message, String);
    assert(err !== null && err.message.startsWith(message), 'Message "' + (err ? err.message : 'No error thrown') + '" does not start with "' + message + '"');
}
//tslint:disable-next-line:prefer-object-spread
exports.default = Object.assign(assert, {
    instanceOf,
    integer,
    between,
    byteUnsignedInteger,
    fail,
    throws,
    equal,
    errorMessage
});
