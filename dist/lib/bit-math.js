"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Efficiently computes `Math.floor(n / 8)`,
 * for positive `n`
 * @param n The number in question
 */
function dividedByEight(n) {
    return n >>> 3;
}
exports.dividedByEight = dividedByEight;
/**
 * Efficiently computes `n % 8`
 * @param n The number in question
 */
function modEight(n) {
    return n & 0b111;
}
exports.modEight = modEight;
/**
 * Efficiently computes `n * 8`
 * @param n The number in question
 */
function timesEight(n) {
    return n << 3;
}
exports.timesEight = timesEight;
