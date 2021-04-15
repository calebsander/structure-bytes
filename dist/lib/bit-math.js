"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timesEight = exports.modEight = exports.dividedByEight = void 0;
/**
 * Efficiently computes `Math.floor(n / 8)`,
 * for positive `n`
 * @param n The number in question
 */
const dividedByEight = (n) => n >>> 3;
exports.dividedByEight = dividedByEight;
/**
 * Efficiently computes `n % 8`
 * @param n The number in question
 */
const modEight = (n) => n & 0b111;
exports.modEight = modEight;
/**
 * Efficiently computes `n * 8`
 * @param n The number in question
 */
const timesEight = (n) => n << 3;
exports.timesEight = timesEight;
