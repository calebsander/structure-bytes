import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

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
 */
export default class MapType<K, V> extends AbsoluteType<Map<K, V>> {
	static get _value() {
		return 0x54
	}
	/**
	 * The type used to serialize keys
	 */
	readonly keyType: Type<K>
	/**
	 * The type used to serialize values
	 */
	readonly valueType: Type<V>
	/**
	 * @param keyType The type of each key in the map
	 * @param valueType The type of each value in the map
	 */
	constructor(keyType: Type<K>, valueType: Type<V>) {
		super()
		assert.instanceOf(keyType, AbstractType)
		assert.instanceOf(valueType, AbstractType)
		this.keyType = keyType
		this.valueType = valueType
	}
	addToBuffer(buffer: AppendableBuffer) {
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
	writeValue(buffer: AppendableBuffer, value: Map<K, V>) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Map)
		buffer.addAll(flexInt.makeValueBuffer(value.size))
		for (const [mapKey, mapValue] of value) { //for each key-value pairing, write key and value
			this.keyType.writeValue(buffer, mapKey)
			this.valueType.writeValue(buffer, mapValue)
		}
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.keyType.equals((otherType as MapType<any, any>).keyType)
			&& this.valueType.equals((otherType as MapType<any, any>).valueType)
	}
}