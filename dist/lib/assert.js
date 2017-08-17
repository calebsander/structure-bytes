"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_inspect_1 = require("./util-inspect");
//A number of useful assertion functions
//Used in tests and for validations in production
function instanceOf(instance, constructors) {
    if (!(constructors instanceof Array))
        constructors = [constructors];
    let constructorMatched = false;
    for (const constructor of constructors) {
        if (instance instanceof constructor ||
            (!(instance === undefined || instance === null) && instance.constructor === constructor) //necessary for primitives
        ) {
            constructorMatched = true;
            break;
        }
    }
    if (!constructorMatched) {
        throw new TypeError(util_inspect_1.inspect(instance) +
            ' is not an instance of ' +
            constructors
                .map(constructor => constructor.name)
                .join(' or '));
    }
}
function integer(instance) {
    instanceOf(instance, Number);
    if (!Number.isSafeInteger(instance)) {
        throw new RangeError(util_inspect_1.inspect(instance) + ' is not an integer');
    }
}
function between(lower, value, upper, message) {
    if (value < lower || value >= upper) {
        const errorMessage = util_inspect_1.inspect(value) +
            ' is not in [' +
            util_inspect_1.inspect(lower) +
            ',' +
            util_inspect_1.inspect(upper) +
            ')';
        if (message === undefined)
            throw new RangeError(errorMessage);
        else
            throw new RangeError(message + ' (' + errorMessage + ')');
    }
}
function byteUnsignedInteger(value) {
    integer(value);
    between(0, value, 256);
}
function fail(message) {
    throw new Error(message);
}
//Assert that a condition is met if not, throw an error with the specified message
function assert(condition, message) {
    if (!condition)
        fail(message || 'Assertion failed');
}
function throws(block, message) {
    let success = true;
    try {
        block();
        success = false;
    }
    catch (e) {
        if (message !== undefined)
            errorMessage(e, message);
    }
    assert(success, message ? 'Was expecting error: ' + message : 'Should throw an error');
}
function equal(actual, expected) {
    const error = () => new RangeError('Expected ' + util_inspect_1.inspect(expected) + ' but got ' + util_inspect_1.inspect(actual));
    if (expected) {
        let matchedSpecialCase = true;
        switch (expected.constructor) {
            case Object: {
                if (!(actual && actual.constructor === Object))
                    throw error();
                for (const key in expected) {
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
function errorMessage(err, message) {
    instanceOf(message, String);
    assert(err !== null && err.message.startsWith(message), 'Message "' + (err ? err.message : 'No error thrown') + '" does not start with "' + message + '"');
}
exports.default = Object.assign(assert, {
    //Assert that the instance is an instance of the constructor, or at least one of the constructors, or a subclass
    instanceOf,
    //Assert that a number is an integer (within the +/-2^53 that can be represented precisely in a double)
    integer,
    //Assert that a number is between the specified values, with an optional message
    between,
    //Assert that a number fits in an unsigned byte
    byteUnsignedInteger,
    //Throw an error
    fail,
    //Assert that the execution of a function throws an error, and that the error message matches the specified one
    throws,
    //Assert that two values are "equal"
    //What this means depends a lot on the type of the expected value
    equal,
    //Assert that an error's message begins with the specified text
    errorMessage
});
