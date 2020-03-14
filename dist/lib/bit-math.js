"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Efficiently computes `Math.floor(n / 8)`,
 * for positive `n`
 * @param n The number in question
 */
exports.dividedByEight = (n) => n >>> 3;
/**
 * Efficiently computes `n % 8`
 * @param n The number in question
 */
exports.modEight = (n) => n & 0b111;
/**
 * Efficiently computes `n * 8`
 * @param n The number in question
 */
exports.timesEight = (n) => n << 3;
