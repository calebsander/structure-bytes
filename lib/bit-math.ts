export function dividedByEight(n: number): number {
	return n >>> 3 //efficiently divide by 8
}
export function modEight(n: number): number {
	return n & 0b111 //efficiently mod 8
}