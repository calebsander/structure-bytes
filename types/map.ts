import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a variable-size mapping of keys of one type to values of another
 * @example
 * //For storing friendships (a mapping of people to their set of friends)
 * let personType = new sb.StructType({...})
 * let type = new sb.MapType(
 *   personType,
 *   new sb.SetType(personType)
 * )
 * @extends Type
 * @inheritdoc
 */
export default class MapType<K, V> extends AbsoluteType<Map<K, V>> {
	static get _value() {
		return 0x54
	}
	readonly keyType: Type<K>
	readonly valueType: Type<V>
	/**
	 * @param {Type} keyType The type of each key in the map
	 * @param {Type} valueType The type of each value in the map
	 */
	constructor(keyType: Type<K>, valueType: Type<V>) {
		super()
		assert.instanceOf(keyType, AbstractType)
		assert.instanceOf(valueType, AbstractType)
		this.keyType = keyType
		this.valueType = valueType
	}
	addToBuffer(buffer: GrowableBuffer) {
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
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Map.<keyType, valueType>} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * let friendMap = new Map
	 * friendMap.set(person1, new Set([person2, person3]))
	 * friendMap.set(person2, new Set([person1]))
	 * friendMap.set(person3, new Set([person1]))
	 * type.writeValue(buffer, friendMap)
	 */
	writeValue(buffer: GrowableBuffer, value: Map<K, V>, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Map)
		buffer.addAll(flexInt.makeValueBuffer(value.size))
		for (const [mapKey, mapValue] of value) { //for each key-value pairing, write key and value
			this.keyType.writeValue(buffer, mapKey, false)
			this.valueType.writeValue(buffer, mapValue, false)
		}
		setPointers({buffer, root})
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.keyType.equals((otherType as MapType<any, any>).keyType)
			&& this.valueType.equals((otherType as MapType<any, any>).valueType)
	}
}