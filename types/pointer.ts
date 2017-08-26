import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import {addInstance, setPointers} from '../lib/pointers'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value `ArrayBuffer`.
 * Each time the value is written, it will use 4 bytes to write the pointer,
 * so you will only save space if the value is longer than 4 bytes and written more than once.
 *
 * Example:
 * ````javascript
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DayType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * ````
 *
 * @param E The type of values that can be written
 */
export default class PointerType<E> extends AbstractType<E> {
	static get _value() {
		return 0x70
	}
	/**
	 * The [[Type]] passed to the constructor
	 */
	readonly type: Type<E>
	/**
	 * @param type The [[Type]] used to write the values being pointed to
	 */
	constructor(type: Type<E>) {
		super()
		assert.instanceOf(type, AbsoluteType)
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
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * let louis = {
	 *   dob: new Date(1437592284193),
	 *   id: 9,
	 *   name: 'Louis'
	 * },
	 * garfield = {
	 *   dob: new Date(1437592284194),
	 *   id: 17,
	 *   name: 'Garfield'
	 * }
	 * let value = {
	 *   leader: {
	 *     dob: new Date(1437592284192),
	 *     id: 10,
	 *     name: 'Joe'
	 *   },
	 *   members: new Set([louis, garfield]),
	 *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
	 * }
	 * tribeType.writeValue(buffer, value)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: E, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		addInstance({buffer, value: this.type.valueBuffer(value)})
		buffer.addAll(new ArrayBuffer(4)) //placeholder for pointer
		setPointers({buffer, root})
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.type.equals((otherType as PointerType<any>).type)
	}
}