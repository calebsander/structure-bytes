import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {makeBaseValue, readFlexInt, ReadResult} from '../lib/read-util'
import {writeIterable} from '../lib/write-util'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import type {Type} from './type'

/**
 * A type storing a variable-size set of values of the same type.
 * Works much like [[ArrayType]] except all values are `Set`s.
 *
 * Example:
 * ````javascript
 * //For storing some number of people
 * let personType = new sb.StructType({
 *   dob: new sb.DayType,
 *   name: new sb.StringType
 * })
 * let type = new sb.SetType(personType)
 * ````
 *
 * @param E The type of each element in the set
 * @param READ_E The type of each element
 * in the read set
 */
export class SetType<E, READ_E extends E = E> extends AbsoluteType<Set<E>, Set<READ_E>> {
	static get _value() {
		return 0x53
	}
	/**
	 * @param type A [[Type]] that can serialize each element in the set
	 */
	constructor(readonly type: Type<E, READ_E>) {
		super()
		assert.instanceOf(type, AbstractType)
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
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
	 * let person1 = {dob: new Date(1980, 3, 10), name: 'Alfred'}
	 * let person2 = {dob: new Date(1970, 4, 9), name: 'Betty'}
	 * let person3 = {dob: new Date(1990, 5, 8), name: 'Cramer'}
	 * type.writeValue(buffer, new Set([person1, person2, person3]))
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: Set<E>) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Set)
		writeIterable({type: this.type, buffer, value, length: value.size})
	}
	consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: Set<READ_E>): ReadResult<Set<READ_E>> {
		//tslint:disable-next-line:prefer-const
		let {value: size, length} = readFlexInt(buffer, offset)
		const value = baseValue || makeBaseValue(this) as Set<READ_E>
		for (let i = 0; i < size; i++) {
			const element = this.type.consumeValue(buffer, offset + length)
			length += element.length
			value.add(element.value)
		}
		return {value, length}
	}
	equals(otherType: unknown): otherType is this {
		return super.equals(otherType) && this.type.equals(otherType.type)
	}
}