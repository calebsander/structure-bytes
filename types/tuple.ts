import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

export interface TupleParams<E> {
	type: Type<E>
	length: number
}
/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 * @example
 * //For storing 5 4-byte unsigned integers
 * let type = new sb.TupleType({type: new sb.UnsignedIntType, length: 5})
 * @extends Type
 * @inheritdoc
 */
export default class TupleType<E> extends AbsoluteType<E[]> {
	static get _value() {
		return 0x50
	}
	readonly type: Type<E>
	readonly length: number
	/**
	 * @param {{type, length}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {number} params.length The number of elements in the tuple.
	 * Must fit in a 1-byte unsigned integer.
	 */
	constructor({type, length}: TupleParams<E>) {
		super()
		assert.instanceOf(type, AbstractType)
		assert.byteUnsignedInteger(length)
		this.type = type
		this.length = length
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.add(this.length)
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [10, 5, 101, 43, 889])
	 */
	writeValue(buffer: GrowableBuffer, value: E[], root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Array)
		assert(
			value.length === this.length,
			'Length does not match: expected ' + String(this.length) + ' but got ' + String(value.length)
		)
		for (const instance of value) this.type.writeValue(buffer, instance, false)
		setPointers({buffer, root})
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.type.equals((otherType as TupleType<any>).type)
			&& this.length === (otherType as TupleType<any>).length
	}
}