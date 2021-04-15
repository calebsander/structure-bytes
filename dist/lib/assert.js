"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equal = exports.nonNegativeInteger = exports.between = exports.integer = exports.instanceOf = void 0;
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
            //Necessary for primitives
            (!(instance === undefined || instance === null) &&
                //eslint-disable-next-line @typescript-eslint/ban-types
                instance.constructor === constructor))
            return;
    }
    throw new TypeError(util_inspect_1.inspect(instance) +
        ' is not an instance of ' +
        constructors.map(({ name }) => name).join(' or '));
}
exports.instanceOf = instanceOf;
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param value The value in question
 */
function integer(value) {
    instanceOf(value, Number);
    if (!Number.isSafeInteger(value)) {
        throw new RangeError(util_inspect_1.inspect(value) + ' is not an integer');
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
 * Throws an error if the given value is not zero or a positive integer
 * @param value The value in question
 */
function nonNegativeInteger(value) {
    integer(value);
    between(0, value, Infinity);
}
exports.nonNegativeInteger = nonNegativeInteger;
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
