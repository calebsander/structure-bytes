"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_inspect_1 = require("./util-inspect");
//A number of useful assertion functions
//Used for validations of types and values
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
exports.instanceOf = instanceOf;
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
exports.integer = integer;
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
        const outOfBoundsMessage = `${value} is not in [${lower},${upper})`;
        throw new RangeError(message ? `${message} (${outOfBoundsMessage})` : outOfBoundsMessage);
    }
}
exports.between = between;
/**
 * Throws an error if the given value is not an integer
 * and in the range that can be represented in an unsigned byte
 * @param value The value in question
 */
function byteUnsignedInteger(value) {
    integer(value);
    between(0, value, 256);
}
exports.byteUnsignedInteger = byteUnsignedInteger;
/** Equality comparisons */
exports.equal = {
    /** Compares two `ArrayBuffer`s and returns whether they are equal */
    buffers(actual, expected) {
        if (actual.byteLength !== expected.byteLength)
            return false;
        const castActual = new Uint8Array(actual);
        const castExpected = new Uint8Array(expected);
        for (let i = 0; i < castActual.length; i++) {
            if (castActual[i] !== castExpected[i])
                return false;
        }
        return true;
    }
};
