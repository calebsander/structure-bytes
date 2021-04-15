"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromUTC = exports.toUTC = exports.MILLIS_PER_DAY = void 0;
/**
 * The number of milliseconds in a day
 */
exports.MILLIS_PER_DAY = 86400000;
const MILLIS_PER_MINUTE = 60000;
/**
 * Converts a date in local time to a UTC timestamp
 * representing the same date and time at UTC
 * @param date The local time
 * @return The epoch time of the same time in UTC
 */
function toUTC(date) {
    return date.getTime() - date.getTimezoneOffset() * MILLIS_PER_MINUTE;
}
exports.toUTC = toUTC;
//Returns a date representing the same time, but in local timezone
/**
 * Converts a UTC timestamp to a date in local time
 * representing the same date in the local timezone
 * @param utc The epoch time during the day in UTC
 * @return A date whose year, month, and date
 * match the UTC year, month, and date
 * of the input timestamp
 */
function fromUTC(utc) {
    const utcDate = new Date(utc);
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
}
exports.fromUTC = fromUTC;
