import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

export interface EnumParams<E> {
	type: Type<E>
	values: E[]
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 * @example
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
 * @extends Type
 * @inheritdoc
 */
export default class EnumType<E> extends AbstractType<E> {
	static get _value() {
		return 0x55
	}
	readonly values: E[]
	private readonly type: Type<E>
	private readonly valueIndices: Map<string, number>
	/**
	 * @param {{type, value}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {type[]} params.values The possible distinct values.
	 * Cannot contain more than 255 values.
	 * @throws {Error} If any value is invalid for {@link type}
	 */
	constructor({type, values}: EnumParams<E>) {
		super()
		assert.instanceOf(type, AbsoluteType) //pointer types don't make sense because each value should be distinct
		assert.instanceOf(values, Array)
		//At most 255 values allowed
		try { assert.byteUnsignedInteger(values.length) }
		catch (e) { assert.fail(String(values.length) + ' values is too many') }

		const valueIndices = new Map<string, number>()
		for (let i = 0; i < values.length; i++) {
			const value = values[i]
			const valueString = bufferString.toBinaryString(type.valueBuffer(value)) //convert value to bytes and then string for use as a map key
			if (valueIndices.has(valueString)) assert.fail('Value is repeated: ' + inspect(value))
			valueIndices.set(valueString, i) //so writing a value has constant-time lookup into the values array
		}
		this.type = type
		this.values = values //used when reading to get constant-time lookup of value index into value
		this.valueIndices = valueIndices
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.add(this.valueIndices.size)
			for (const valueBuffer of this.valueIndices.keys()) {
				buffer.addAll(bufferString.fromBinaryString(valueBuffer))
			}
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, CHEETAH)
	 */
	writeValue(buffer: GrowableBuffer, value: E, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		const valueBuffer = new GrowableBuffer
		this.type.writeValue(valueBuffer, value, false)
		const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer.toBuffer()))
		if (index === undefined) throw new Error('Not a valid enum value: ' + inspect(value))
		buffer.add(index) //write the index to the requested value in the values array
		setPointers({buffer, root})
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