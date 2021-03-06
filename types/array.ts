import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {BufferOffset, makeBaseValue, readFlexInt} from '../lib/read-util'
import {writeIterable} from '../lib/write-util'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import type {Type} from './type'

/**
 * A type storing a variable-length array of values of the same type
 *
 * Example:
 * ````javascript
 * class Car {
 *   constructor(brand, model, year) {
 *     this.brand = brand
 *     this.model = model
 *     this.year = year
 *   }
 * }
 * let carType = new sb.StructType({ //Type<Car>
 *   brand: new sb.StringType,
 *   model: new sb.StringType,
 *   year: new sb.ShortType
 * })
 * let type = new sb.ArrayType(carType) //Type<Car[]>
 * ````
 *
 * @param E The type of each element in the array
 * @param READ_E The type of each element
 * in the read array
 */
export class ArrayType<E, READ_E extends E = E> extends AbsoluteType<E[], READ_E[]> {
	static get _value(): number {
		return 0x52
	}
	/**
	 * @param type A [[Type]] that can serialize each element in the array
	 */
	constructor(readonly type: Type<E, READ_E>) {
		super()
		assert.instanceOf(type, AbstractType)
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
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
	 * let car1 = new Car('VW', 'Bug', 1960)
	 * let car2 = new Car('Honda', 'Fit', 2015)
	 * let car3 = new Car('Tesla', 'Model 3', 2017)
	 * type.writeValue(buffer, [car1, car2, car3])
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E[]): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, Array)
		writeIterable({type: this.type, buffer, value, length: value.length})
	}
	consumeValue(bufferOffset: BufferOffset, baseValue?: READ_E[]): READ_E[] {
		const arrayLength = readFlexInt(bufferOffset)
		const value = baseValue || makeBaseValue(this, arrayLength) as READ_E[]
		for (let i = 0; i < arrayLength; i++) {
			value[i] = this.type.consumeValue(bufferOffset)
		}
		return value
	}
	equals(otherType: unknown): boolean {
		return this.isSameType(otherType) && this.type.equals(otherType.type)
	}
}