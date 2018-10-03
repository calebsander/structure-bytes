import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import {makeBaseValue, readFlexInt, ReadResult} from '../lib/read-util'
import writeIterable from '../lib/write-iterable'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import {Type} from './type'

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
	static get _value() {
		return 0x52
	}
	/**
	 * The [[Type]] passed into the constructor
	 */
	readonly type: Type<E, READ_E>
	/**
	 * @param type A [[Type]] that can serialize each element in the array
	 */
	constructor(type: Type<E, READ_E>) {
		super()
		assert.instanceOf(type, AbstractType)
		this.type = type
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
	 * let car1 = new Car('VW', 'Bug', 1960)
	 * let car2 = new Car('Honda', 'Fit', 2015)
	 * let car3 = new Car('Tesla', 'Model 3', 2017)
	 * type.writeValue(buffer, [car1, car2, car3])
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E[]) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Array)
		writeIterable({type: this.type, buffer, value, length: value.length})
	}
	consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: READ_E[]): ReadResult<READ_E[]> {
		const arrayLengthInt = readFlexInt(buffer, offset)
		const arrayLength = arrayLengthInt.value
		let {length} = arrayLengthInt
		const value = baseValue || makeBaseValue(this, arrayLength) as READ_E[]
		for (let i = 0; i < arrayLength; i++) {
			const element = this.type.consumeValue(buffer, offset + length)
			length += element.length
			value[i] = element.value
		}
		return {value, length}
	}
	equals(otherType: any) {
		return super.equals(otherType) && this.type.equals((otherType as ArrayType<any>).type)
	}
}