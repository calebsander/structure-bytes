import * as bufferString from './buffer-string'
import GrowableBuffer from './growable-buffer'

//Map of write buffers to maps of binary strings to sets of indices where pointers to the binary data must be written
const pointers = new WeakMap<GrowableBuffer, Map<string, Set<number>>>()

export interface AddInstanceParams {
	buffer: GrowableBuffer
	value: ArrayBuffer
}
export function addInstance({buffer, value}: AddInstanceParams) {
	let bufferPointers = pointers.get(buffer)
	if (!bufferPointers) {
		bufferPointers = new Map //initialize pointers map if it doesn't exist
		pointers.set(buffer, bufferPointers)
	}
	const valueString = bufferString.toBinaryString(value) //have to convert the buffer to a string because equivalent buffers are not ===
	const currentIndex = buffer.length
	const pointerLocations = bufferPointers.get(valueString)
	if (pointerLocations) pointerLocations.add(currentIndex)
	else bufferPointers.set(valueString, new Set([currentIndex]))
}

export interface SetPointersParams {
	buffer: GrowableBuffer
	root: boolean
}
//After writing all the values, it is necessary to insert all the values of pointer types
//This function should be called in writeValue() for every type that could have a subtype that is a pointer type
export function setPointers({buffer, root}: SetPointersParams) {
	if (root) { //ensure this only happens once
		const bufferPointers = pointers.get(buffer)
		if (bufferPointers) {
			for (const [binaryString, insertionIndices] of bufferPointers) { //find all the locations where pointers must be inserted
				const index = buffer.length //value is going to be appended to buffer, so it will start at buffer.length
				buffer.addAll(bufferString.fromBinaryString(binaryString)) //add raw data
				const indexBuffer = new ArrayBuffer(4)
				new DataView(indexBuffer).setUint32(0, index)
				//In each pointer location, set the bytes to be a pointer to the correct location
				for (const insertionIndex of insertionIndices) buffer.setAll(insertionIndex, indexBuffer)
			}
		}
	}
}