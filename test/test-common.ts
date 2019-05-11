import * as builtinAssert from 'assert'

//Polyfill for Node.js 8
export const assert = builtinAssert.strict || Object.assign(builtinAssert, {
	equal: builtinAssert.strictEqual,
	deepEqual: builtinAssert.deepStrictEqual,
	notEqual: builtinAssert.notStrictEqual,
	notDeepEqual: builtinAssert.notDeepStrictEqual
})

export function concat(buffers: Uint8Array[]): Uint8Array {
	const result = new Uint8Array(buffers.reduce((a, {length}) => a + length, 0))
	let length = 0
	for (const buffer of buffers) {
		result.set(buffer, length)
		length += buffer.length
	}
	return result
}