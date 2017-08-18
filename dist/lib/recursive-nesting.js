"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap();
function increment(buffer) {
    const lastValue = recursiveNesting.get(buffer) || 0;
    recursiveNesting.set(buffer, lastValue + 1);
}
exports.increment = increment;
function decrement(buffer) {
    const lastValue = recursiveNesting.get(buffer);
    recursiveNesting.set(buffer, lastValue - 1);
}
exports.decrement = decrement;
function get(buffer) {
    return recursiveNesting.get(buffer);
}
exports.get = get;
