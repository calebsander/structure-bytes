import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import UnsignedType from './unsigned'

/**
 * A type storing any unsigned integer
 * that can be represented precisely in a double
 * (from 0 to 9007199254740991 (2^53 - 1)).
 * Rather than having a fixed-length value representation,
 * more bytes are needed to represent larger values.
 * This is inspired by the UTF-8 format:
 * large values can be stored, but since most values
 * are small, fewer bytes are used in the typical case.<br>
 * <br>
 * The number of bytes required for numbers are as follows:
 * <table>
 *   <thead><tr><th>Number range</th><th>Bytes</th></tr></thead>
 *   <tbody>
 *     <tr><td>0 to 127</td><td>1</td></tr>
 *     <tr><td>128 to 16511</td><td>2</td></tr>
 *     <tr><td>16512 to 2113663</td><td>3</td></tr>
 *     <tr><td>2113664 to 270549119</td><td>4</td></tr>
 *     <tr><td>270549120 to 34630287487</td><td>5</td></tr>
 *     <tr><td>34630287488 to 4432676798591</td><td>6</td></tr>
 *     <tr><td>4432676798592 to 567382630219903</td><td>7</td></tr>
 *     <tr><td>567382630219904 to 9007199254740991</td><td>8</td></tr>
 *   </tbody>
 * </table>
 * @extends Type
 * @inheritdoc
 */
export default class FlexUnsignedIntType extends UnsignedType<number | string> {
	static get _value() {
		return 0x17
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write (between 0 and 9007199254740991)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: number | string) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		buffer.addAll(flexInt.makeValueBuffer(value as number))
	}
}