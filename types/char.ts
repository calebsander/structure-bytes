import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import {BufferOffset, NOT_LONG_ENOUGH} from '../lib/read-util'
import AbsoluteType from './absolute'

/**
 * A type storing a single unicode character
 *
 * Example:
 * ````javascript
 * let type = new sb.CharType
 * ````
 */
export class CharType extends AbsoluteType<string> {
	static get _value(): number {
		return 0x40
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 'é') //takes up 2 bytes in UTF-8
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: string): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, String)
		if (value.length !== 1) throw new Error('String must contain only 1 character')
		buffer.addAll(bufferString.fromString(value))
	}
	consumeValue(bufferOffset: BufferOffset): string {
		const {buffer, offset} = bufferOffset
		const [value] = bufferString.toString(new Uint8Array(buffer, offset), 1)
		if (!value) throw new Error(NOT_LONG_ENOUGH)

		bufferOffset.offset += bufferString.fromString(value).byteLength
		return value
	}
}