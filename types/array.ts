import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import writeIterable from '../lib/write-iterable'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a variable-length array of values of the same type
 * @example
 * //For storing some number of people in order
 * let personType = new sb.StructType({...})
 * let type = new sb.ArrayType(personType)
 * @extends Type
 * @inheritdoc
 */
export default class ArrayType<E> extends AbsoluteType<E[]> {
	static get _value() {
		return 0x52
	}
	readonly type: Type<E>
	/**
	 * @param {Type} type The type of each element in the array
	 */
	constructor(type: Type<E>) {
		super()
		assert.instanceOf(type, AbstractType)
		this.type = type
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
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
	 * type.writeValue(buffer, [person1, person2, person3])
	 */
	writeValue(buffer: GrowableBuffer, value: E[], root = true) {
		assert.instanceOf(value, Array)
		writeIterable({type: this.type, buffer, value, length: value.length, root})
	}
	equals(otherType: any) {
		return super.equals(otherType) && this.type.equals((otherType as ArrayType<any>).type)
	}
}