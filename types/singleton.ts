import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import {inspect} from '../lib/util-inspect'
import AbstractType from './abstract'
import Type from './type'

export interface SingletonParams<E> {
	type: Type<E, any>
	value: E
}
/**
 * A type storing a fixed value.
 * The value takes up no space in the value bytes,
 * only the type bytes.
 * Functions as an [[EnumType]] with only one value.
 *
 * Example:
 * ````javascript
 * //Encodes a JSON literal value
 * let type = new sb.ChoiceType([
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'boolean'
 *     }),
 *     value: new sb.BooleanType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'number'
 *     }),
 *     value: new sb.DoubleType
 *   }),
 *   new sb.StructType({
 *     type: new sb.SingletonType({
 *       type: new sb.StringType,
 *       value: 'string'
 *     }),
 *     value: new sb.StringType
 *   })
 * ])
 * ````
 *
 * @param E The type of the value
 */
export default class SingletonType<E> extends AbstractType<E> {
	static get _value() {
		return 0x59
	}
	/** The type used to serialize the value */
	readonly type: Type<E>
	/** The value that this type serializes */
	readonly value: E
	private cachedValueBuffer: ArrayBuffer | undefined
	/**
	 * @param type The type that can serialize this type's value
	 * @param value The value to serialize
	 * @throws If `value` cannot be serialized by `type`
	 */
	constructor({type, value}: SingletonParams<E>) {
		super()
		assert.instanceOf(type, AbstractType)
		this.type = type
		this.value = value
	}
	private get singletonValueBuffer() {
		return this.cachedValueBuffer ||
			(this.cachedValueBuffer = this.type.valueBuffer(this.value))
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.addAll(this.singletonValueBuffer)
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
	 * type.writeValue(buffer, {type: 'boolean', value: true})
	 * type.writeValue(buffer, {type: 'string', value: 'abc'})
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E) {
		this.isBuffer(buffer)
		try { assert.equal(this.type.valueBuffer(value), this.singletonValueBuffer) }
		catch {
			assert.fail(`Expected ${inspect(this.value)} but got ${inspect(value)}`)
		}
	}
	consumeValue() {
		return {value: this.value, length: 0}
	}
	equals(otherType: any) {
		if (!super.equals(otherType)) return false
		const otherSingletonType = otherType as SingletonType<any>
		if (!this.type.equals(otherSingletonType.type)) return false
		try { assert.equal(this.value, otherSingletonType.value) }
		catch { return false }
		return true
	}
}