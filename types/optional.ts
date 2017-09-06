import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a value of another type or `null` or `undefined`.
 * `null` and `undefined` are treated identically,
 * and reading either value will result in `null`.
 *
 * Example:
 * ````javascript
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({
 *   age: new sb.UnsignedByteType,
 *   name: new sb.StringType
 * })
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * ````
 *
 * @param E The type of non-`null` values
 */
export default class OptionalType<E> extends AbsoluteType<E | null | undefined> {
	static get _value() {
		return 0x60
	}
	/**
	 * The [[Type]] passed into the constructor
	 */
	readonly type: Type<E>
	/**
	 * @param type The [[Type]] used to write values
	 * if they are not `null` or `undefined`
	 */
	constructor(type: Type<E>) {
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
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, {
	 *   title: 'Manager',
	 *   employee: null //or undefined
	 * })
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, {
	 *   title: 'Coder',
	 *   employee: {age: 19, name: 'Johnny'}
	 * })
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E | null | undefined) {
		this.isBuffer(buffer)
		switch (value) {
			case null:
			case undefined:
				buffer.add(0x00)
				break
			default:
				buffer.add(0xFF)
				this.type.writeValue(buffer, value)
		}
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.type.equals((otherType as OptionalType<any>).type)
	}
}