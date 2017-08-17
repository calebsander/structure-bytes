export const MILLIS_PER_DAY = 86400000
const MILLIS_PER_MINUTE = 60000
//Returns a date representing the same time, but in UTC
export function toUTC(date: Date): number {
	return date.getTime() - date.getTimezoneOffset() * MILLIS_PER_MINUTE
}
//Returns a date representing the same time, but in local timezone
export function fromUTC(utc: number): Date {
	const utcDate = new Date(utc)
	return new Date(
		utcDate.getUTCFullYear(),
		utcDate.getUTCMonth(),
		utcDate.getUTCDate()
	)
}