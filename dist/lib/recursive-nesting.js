"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.decrement = exports.increment = void 0;
//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap();
/**
 * Increments the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to increment
 */
function increment(buffer) {
    const lastValue = recursiveNesting.get(buffer) || 0;
    recursiveNesting.set(buffer, lastValue + 1);
}
exports.increment = increment;
/**
 * Decrements the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to decrement
 */
function decrement(buffer) {
    const lastValue = recursiveNesting.get(buffer);
    if (!lastValue)
        throw new Error('Buffer has no recursive nesting');
    recursiveNesting.set(buffer, lastValue - 1);
}
exports.decrement = decrement;
/**
 * Gets the current number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to get
 * @return The number of [[increment]]s minus
 * the number of [[decrement]]s called on the buffer
 */
const get = (buffer) => recursiveNesting.get(buffer);
exports.get = get;
