/**
 * Efficiently computes `Math.floor(n / 8)`,
 * for positive `n`
 * @param n The number in question
 */
export const dividedByEight = (n: number): number =>
	n >>> 3
/**
 * Efficiently computes `n % 8`
 * @param n The number in question
 */
export const modEight = (n: number): number =>
	n & 0b111
/**
 * Efficiently computes `n * 8`
 * @param n The number in question
 */
export const timesEight = (n: number): number =>
	n << 3