"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap();
/**
 * Increments the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to increment
 */
function increment(buffer) {
    var _a;
    const lastValue = (_a = recursiveNesting.get(buffer)) !== null && _a !== void 0 ? _a : 0;
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
exports.get = (buffer) => recursiveNesting.get(buffer);
