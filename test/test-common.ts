export function bufferFrom(bytes: number[]) {
	const buffer = new Uint8Array(bytes.length)
	buffer.set(bytes)
	return buffer
}
export function bufferFill(length: number, value: number) {
	const buffer = new Uint8Array(length)
	return buffer.fill(value)
}
export function concat(buffers: Uint8Array[]): Uint8Array {
	let length = 0
	for (const buffer of buffers) length += buffer.length
	const result = new Uint8Array(length)
	length = 0
	for (const buffer of buffers) {
		result.set(buffer, length)
		length += buffer.length
	}
	return result
}