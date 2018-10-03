import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import {NOT_LONG_ENOUGH, ReadResult} from '../lib/read-util'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import {Type} from './type'

export interface EnumParams<E> {
	type: Type<E>
	values: E[]
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 *
 * Example:
 * ````javascript
 * //Storing different species' characteristics
 * const HUMAN = {heightFt: 6, speedMph: 28}
 * const CHEETAH = {heightFt: 3, speedMph: 70}
 * let type = new sb.EnumType({
 *   type: new sb.StructType({
 *     heightFt: new sb.FloatType,
 *     speedMph: new sb.UnsignedByteType
 *   }),
 *   values: [HUMAN, CHEETAH]
 * })
 * ````
 *
 * @param E The type of each value in the enum
 */
export class EnumType<E> extends AbstractType<E> {
	static get _value() {
		return 0x55
	}
	/** The list of possible values */
	readonly values: E[]
	readonly type: Type<E>
	private cachedValueIndices: Map<string, number> | undefined
	/**
	 * @param type The type of each value of the enum
	 * @param values The possible distinct values.
	 * Cannot contain more than 255 values.
	 * @throws If any value cannot be serialized by `type`
	 */
	constructor({type, values}: EnumParams<E>) {
		super()
		assert.instanceOf(type, AbsoluteType) //pointer types don't make sense because each value should be distinct
		assert.instanceOf(values, Array)
		//At most 255 values allowed
		try { assert.byteUnsignedInteger(values.length) }
		catch { assert.fail(`${values.length} values is too many`) }

		this.type = type
		this.values = values //used when reading to get constant-time lookup of value index into value
	}
	private get valueIndices() {
		const {type, values, cachedValueIndices} = this
		if (cachedValueIndices) return cachedValueIndices

		const valueIndices = new Map<string, number>()
		for (let i = 0; i < values.length; i++) {
			const value = values[i]
			const valueString = bufferString.toBinaryString(type.valueBuffer(value)) //convert value to bytes and then string for use as a map key
			if (valueIndices.has(valueString)) assert.fail('Value is repeated: ' + inspect(value))
			valueIndices.set(valueString, i) //so writing a value has constant-time lookup into the values array
		}
		return this.cachedValueIndices = valueIndices
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.add(this.values.length)
			for (const valueBuffer of this.valueIndices.keys()) {
				buffer.addAll(bufferString.fromBinaryString(valueBuffer))
			}
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
	 * type.writeValue(buffer, CHEETAH)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E) {
		this.isBuffer(buffer)
		const valueBuffer = this.type.valueBuffer(value)
		const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer))
		if (index === undefined) throw new Error('Not a valid enum value: ' + inspect(value))
		buffer.add(index) //write the index to the requested value in the values array
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<E> {
		assert(buffer.byteLength > offset, NOT_LONG_ENOUGH)
		const valueIndex = new Uint8Array(buffer)[offset]
		const value = this.values[valueIndex] as E | undefined
		if (value === undefined) throw new Error(`Index ${valueIndex} is invalid`)
		return {value, length: 1}
	}
	equals(otherType: any) {
		if (!super.equals(otherType)) return false
		const otherEnumType = otherType as EnumType<any>
		if (!this.type.equals(otherEnumType.type)) return false
		if (this.values.length !== otherEnumType.values.length) return false
		const otherValuesIterator = otherEnumType.valueIndices.keys()
		for (const thisValue of this.valueIndices.keys()) {
			const otherValue = otherValuesIterator.next().value
			if (otherValue !== thisValue) return false
		}
		return true
	}
}