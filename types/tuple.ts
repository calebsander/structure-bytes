import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import {makeBaseValue, ReadResult} from '../lib/read-util'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import {Type} from './type'

/**
 * A [[Type]] for writing values of type `E`
 * and a number of elements in the tuple
 *
 * @param E The type of each element in the tuple
 * @param READ_E The type of each element
 * in the read tuple
 */
export interface TupleParams<E, READ_E extends E> {
	type: Type<E, READ_E>
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
 * @param READ_E The type of each element
 * in the read tuple
 */
export class TupleType<E, READ_E extends E = E> extends AbsoluteType<E[], READ_E[]> {
	static get _value() {
		return 0x50
	}
	/**
	 * The [[Type]] passed to the constructor
	 */
	readonly type: Type<E, READ_E>
	/**
	 * The length passed to the constructor
	 */
	readonly length: number
	/**
	 * @param type A [[Type]] that can write each element in the tuple
	 * @param length The number of elements in the tuple.
	 * Must be at most 255.
	 */
	constructor({type, length}: TupleParams<E, READ_E>) {
		super()
		assert.instanceOf(type, AbstractType)
		assert.byteUnsignedInteger(length)
		this.type = type
		this.length = length
	}
	addToBuffer(buffer: AppendableBuffer) {
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
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
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
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E[]) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Array)
		assert(
			value.length === this.length,
			`Length does not match: expected ${this.length} but got ${value.length}`
		)
		for (const instance of value) this.type.writeValue(buffer, instance)
	}
	consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: READ_E[]): ReadResult<READ_E[]> {
		let length = 0
		const value: READ_E[] = baseValue || makeBaseValue(this) as READ_E[] //TypeScript complains if annotation is left off `value`
		for (let i = 0; i < this.length; i++) {
			const element = this.type.consumeValue(buffer, offset + length)
			length += element.length
			value[i] = element.value
		}
		return {value, length}
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.type.equals((otherType as TupleType<any>).type)
			&& this.length === (otherType as TupleType<any>).length
	}
}