import type {AppendableBuffer} from './appendable'

//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap<AppendableBuffer, number>()

/**
 * Increments the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to increment
 */
export function increment(buffer: AppendableBuffer): void {
	const lastValue = recursiveNesting.get(buffer) || 0
	recursiveNesting.set(buffer, lastValue + 1)
}
/**
 * Decrements the number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to decrement
 */
export function decrement(buffer: AppendableBuffer): void {
	const lastValue = recursiveNesting.get(buffer)
	if (!lastValue) throw new Error('Buffer has no recursive nesting')
	recursiveNesting.set(buffer, lastValue - 1)
}
/**
 * Gets the current number of levels the specified
 * value write buffer is currently deep in recursive types
 * @param buffer The buffer whose value to get
 * @return The number of [[increment]]s minus
 * the number of [[decrement]]s called on the buffer
 */
export const get = (buffer: AppendableBuffer): number | undefined =>
	recursiveNesting.get(buffer)