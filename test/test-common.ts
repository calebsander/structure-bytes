import GrowableBuffer from '../dist/lib/growable-buffer'

export function bufferFrom(bytes: number[]) {
	const buffer = new ArrayBuffer(bytes.length)
	new Uint8Array(buffer).set(bytes)
	return buffer
}
export function bufferFill(length: number, value: number) {
	const buffer = new ArrayBuffer(length)
	new Uint8Array(buffer).fill(value)
	return buffer
}
export function concat(buffers: ArrayBuffer[]): ArrayBuffer {
	const gb = new GrowableBuffer
	for (const buffer of buffers) gb.addAll(buffer)
	return gb.toBuffer()
}