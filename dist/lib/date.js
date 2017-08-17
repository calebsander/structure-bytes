"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILLIS_PER_DAY = 86400000;
const MILLIS_PER_MINUTE = 60000;
//Returns a date representing the same time, but in UTC
function toUTC(date) {
    return date.getTime() - date.getTimezoneOffset() * MILLIS_PER_MINUTE;
}
exports.toUTC = toUTC;
//Returns a date representing the same time, but in local timezone
function fromUTC(utc) {
    const utcDate = new Date(utc);
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
}
exports.fromUTC = fromUTC;
