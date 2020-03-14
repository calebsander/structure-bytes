import {inspect} from './util-inspect'

//A number of useful assertion functions
//Used for validations of types and values

/**
 * Throws an error if the given value is not an instance
 * of any of the provided constructors
 * @param instance The value in question
 * @param constructors A constructor or array of constructors to test against
 */
export function instanceOf(instance: unknown, constructors: Function | Function[]): void {
	if (!(constructors instanceof Array)) constructors = [constructors]
	for (const constructor of constructors) {
		if (
			instance instanceof constructor ||
			//Necessary for primitives
			(
				!(instance === undefined || instance === null) &&
				(instance as any).constructor === constructor
			)
		) return
	}
	throw new TypeError(
		inspect(instance) +
		' is not an instance of ' +
		constructors.map(({name}) => name).join(' or ')
	)
}
/**
 * Throws an error if the given value is not an integer
 * within the range of integers representable in JavaScript
 * @param value The value in question
 */
export function integer(value: unknown): asserts value is number {
	instanceOf(value, Number)
	if (!Number.isSafeInteger(value as number)) {
		throw new RangeError(inspect(value) + ' is not an integer')
	}
}
/**
 * Throws an error if a numeric value is not between
 * the given bounds
 * @param lower The lower bound (inclusive)
 * @param value The value in question
 * @param upper The upper bound (exclusive)
 * @param message An optional message to include in the error message
 */
export function between(lower: number, value: number, upper: number, message?: string): void {
	if (value < lower || value >= upper) {
		const outOfBoundsMessage = `${value} is not in [${lower},${upper})`
		throw new RangeError(message ? `${message} (${outOfBoundsMessage})` : outOfBoundsMessage)
	}
}
/**
 * Throws an error if the given value is not zero or a positive integer
 * @param value The value in question
 */
export function nonNegativeInteger(value: unknown): asserts value is number {
	integer(value)
	between(0, value, Infinity)
}
/** Equality comparisons */
export const equal = {
	/** Compares two `ArrayBuffer`s and returns whether they are equal */
	buffers(actual: ArrayBuffer, expected: ArrayBuffer) {
		if (actual.byteLength !== expected.byteLength) return false
		const castActual = new Uint8Array(actual)
		const castExpected = new Uint8Array(expected)
		for (let i = 0; i < castActual.length; i++) {
			if (castActual[i] !== castExpected[i]) return false
		}
		return true
	}
}