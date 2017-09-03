import GrowableBuffer from './growable-buffer'

//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap<GrowableBuffer, number>()

/**
 * Increments the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to increment
 */
export function increment(buffer: GrowableBuffer): void {
	const lastValue = recursiveNesting.get(buffer) || 0
	recursiveNesting.set(buffer, lastValue + 1)
}
/**
 * Decrements the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to decrement
 */
export function decrement(buffer: GrowableBuffer): void {
	const lastValue = recursiveNesting.get(buffer) as number
	recursiveNesting.set(buffer, lastValue - 1)
}
/**
 * Gets the current number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to get
 * @return The number of [[increment]]s minus
 * the number of [[decrement]]s called on the buffer
 */
export function get(buffer: GrowableBuffer): number | undefined {
	return recursiveNesting.get(buffer)
}