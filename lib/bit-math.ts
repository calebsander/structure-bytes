/**
 * Efficiently computes `Math.floor(n / 8)`,
 * for positive `n`
 * @param n The number in question
 */
export function dividedByEight(n: number): number {
	return n >>> 3
}
/**
 * Efficiently computes `n % 8`
 * @param n The number in question
 */
export function modEight(n: number): number {
	return n & 0b111
}
/**
 * Efficiently computes `n * 8`
 * @param n The number in question
 */
export function timesEight(n: number): number {
	return n << 3
}