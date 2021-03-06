import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {BufferOffset, readBooleanByte} from '../lib/read-util'
import {writeBooleanByte} from '../lib/write-util'
import AbsoluteType from './absolute'

/**
 * A type storing a `Boolean` value (1 bit)
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanType
 * ````
 */
export class BooleanType extends AbsoluteType<boolean> {
	static get _value(): number {
		return 0x30
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, true)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: boolean): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, Boolean)
		writeBooleanByte(buffer, value)
	}
	consumeValue(bufferOffset: BufferOffset): boolean {
		return readBooleanByte(bufferOffset)
	}
}