/**
 * The number of milliseconds in a day
 */
export declare const MILLIS_PER_DAY = 86400000;
/**
 * Converts a date in local time to a UTC timestamp
 * representing the same date and time at UTC
 * @param date The local time
 * @return The epoch time of the same time in UTC
 */
export declare function toUTC(date: Date): number;
/**
 * Converts a UTC timestamp to a date in local time
 * representing the same date in the local timezone
 * @param utc The epoch time during the day in UTC
 * @return A date whose year, month, and date
 * match the UTC year, month, and date
 * of the input timestamp
 */
export declare function fromUTC(utc: number): Date;
