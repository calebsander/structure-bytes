import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A [[Type]] for writing values of type `E`
 * and a number of elements in the tuple
 *
 * @param E The type of each element in the tuple
 */
export interface TupleParams<E> {
	type: Type<E>
	length: number
}
/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 *
 * Example:
 * ````javascript
 * //For storing a 3x3 matrix
 * //This represents values just as efficiently
 * //as a single tuple with 9 elements
 * let type = new sb.TupleType({
 *   type: new sb.TupleType({
 *     type: new sb.FloatType,
 *     length: 3
 *   }),
 *   length: 3
 * })
 * ````
 *
 * @param E The type of each element in the tuple
 */
export default class TupleType<E> extends AbsoluteType<E[]> {
	static get _value() {
		return 0x50
	}
	/**
	 * The [[Type]] passed to the constructor
	 */
	readonly type: Type<E>
	/**
	 * The length passed to the constructor
	 */
	readonly length: number
	/**
	 * @param type A [[Type]] that can write each element in the tuple
	 * @param number The number of elements in the tuple.
	 * Must be at most 255.
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
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, [
	 *   [1, 2, 3],
	 *   [4, 5, 6],
	 *   [7, 8, 9]
	 * ])
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
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