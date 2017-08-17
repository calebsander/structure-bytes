"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dividedByEight(n) {
    return n >>> 3; //efficiently divide by 8
}
exports.dividedByEight = dividedByEight;
function modEight(n) {
    return n & 0b111; //efficiently mod 8
}
exports.modEight = modEight;
