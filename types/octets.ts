import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import AbsoluteType from './absolute'

/**
 * A type storing an array of bytes.
 * This is intended for data, e.g. a hash, that doesn't fit any other category.
 * @extends Type
 * @inheritdoc
 */
export default class OctetsType extends AbsoluteType<ArrayBuffer> {
	static get _value() {
		return 0x42
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:ArrayBuffer} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: ArrayBuffer) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, ArrayBuffer)
		buffer.addAll(flexInt.makeValueBuffer(value.byteLength))
		buffer.addAll(value)
	}
}