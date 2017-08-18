import assert from './assert'
import * as flexInt from './flex-int'
import GrowableBuffer from './growable-buffer'
import {setPointers} from './pointers'
import Type from '../types/type'

export interface IterableWriteParams<E> {
	type: Type<E>
	buffer: GrowableBuffer
	value: Iterable<E>
	length: number
	root: boolean
}
/**
 * Writes any iterable value to the buffer.
 * Used by ArrayType and SetType.
 * Appends value bytes to a {@link GrowableBuffer} according to the type.
 * @param {Type<type>} type The type to use to write individual elements
 * @param {GrowableBuffer} buffer The buffer to which to append
 * @param {Iterable<type>} value The value to write
 * @param {number} length The number of elements in <tt>value</tt>
 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
*/
export default <E>({type, buffer, value, length, root}: IterableWriteParams<E>): void => {
	assert.instanceOf(buffer, GrowableBuffer)
	buffer.addAll(flexInt.makeValueBuffer(length))
	for (const instance of value) type.writeValue(buffer, instance, false)
	setPointers({buffer, root})
}