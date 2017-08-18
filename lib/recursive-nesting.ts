import GrowableBuffer from './growable-buffer'

//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap<GrowableBuffer, number>()

export function increment(buffer: GrowableBuffer) {
	const lastValue = recursiveNesting.get(buffer) || 0
	recursiveNesting.set(buffer, lastValue + 1)
}
export function decrement(buffer: GrowableBuffer) {
	const lastValue = recursiveNesting.get(buffer) as number
	recursiveNesting.set(buffer, lastValue - 1)
}
export function get(buffer: GrowableBuffer): number | undefined {
	return recursiveNesting.get(buffer)
}