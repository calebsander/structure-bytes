import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {BufferOffset, makeBaseValue, readFlexInt} from '../lib/read-util'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import type {Type} from './type'

/**
 * A type storing a variable-size mapping of keys of one type to values of another
 *
 * Example:
 * ````javascript
 * //For storing stock prices on different days
 * let type = new sb.MapType(
 *   new sb.StringType,
 *   new sb.MapType(
 *     new sb.DayType,
 *     new sb.FloatType
 *   )
 * )
 * ````
 *
 * @param K The type of values stored in keys of the map
 * @param V The type of values stored in values of the map
 * @param READ_K The type of keys this type will read
 * @param READ_V The type of values this type will read
 */
export class MapType<K, V, READ_K extends K = K, READ_V extends V = V> extends AbsoluteType<Map<K, V>, Map<READ_K, READ_V>> {
	static get _value(): number {
		return 0x54
	}
	/**
	 * @param keyType The type of each key in the map
	 * @param valueType The type of each value in the map
	 */
	constructor(readonly keyType: Type<K, READ_K>, readonly valueType: Type<V, READ_V>) {
		super()
		assert.instanceOf(keyType, AbstractType)
		assert.instanceOf(valueType, AbstractType)
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.keyType.addToBuffer(buffer)
			this.valueType.addToBuffer(buffer)
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
	 * let GOOG = new Map()
	 *   .set(new Date(2000, 0, 1), 33.2)
	 *   .set(new Date(2000, 0, 2), 38.5)
	 *   .set(new Date(2000, 0, 3), 39.9)
	 * let YHOO = new Map()
	 *   .set(new Date(2010, 0, 1), 10.1)
	 *   .set(new Date(2010, 0, 2), 10.2)
	 * let AMZN = new Map()
	 * let stocks = new Map()
	 *   .set('GOOG', GOOG)
	 *   .set('YHOO', YHOO)
	 *   .set('AMZN', AMZN)
	 * type.writeValue(buffer, stocks)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: Map<K, V>): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, Map)
		buffer.addAll(flexInt.makeValueBuffer(value.size))
		for (const [mapKey, mapValue] of value) { //for each key-value pairing, write key and value
			this.keyType.writeValue(buffer, mapKey)
			this.valueType.writeValue(buffer, mapValue)
		}
	}
	consumeValue(bufferOffset: BufferOffset, baseValue?: Map<READ_K, READ_V>): Map<READ_K, READ_V> {
		const size = readFlexInt(bufferOffset)
		const value = baseValue || makeBaseValue(this) as Map<READ_K, READ_V>
		for (let i = 0; i < size; i++) {
			const keyElement = this.keyType.consumeValue(bufferOffset)
			const valueElement = this.valueType.consumeValue(bufferOffset)
			value.set(keyElement, valueElement)
		}
		return value
	}
	equals(otherType: unknown): boolean {
		return this.isSameType(otherType)
			&& this.keyType.equals(otherType.keyType)
			&& this.valueType.equals(otherType.valueType)
	}
}