import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import * as flexInt from '../lib/flex-int'
import {readFlexInt, ReadResult} from '../lib/read-util'
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
	static get _value(): number {
		return 0x55
	}
	/** The list of possible values */
	readonly values: E[]
	/** The type used to serialize the values */
	readonly type: Type<E>
	private cachedValueIndices: Map<string, number> | undefined
	/**
	 * @param type The type of each value of the enum
	 * @param values The possible distinct values.
	 * @throws If any value cannot be serialized by `type`
	 */
	constructor({type, values}: EnumParams<E>) {
		super()
		assert.instanceOf(type, AbsoluteType) //pointer types don't make sense because each value should be distinct
		assert.instanceOf(values, Array)

		this.type = type
		this.values = values //used when reading to get constant-time lookup of value index into value
	}
	private get valueIndices(): Map<string, number> {
		if (!this.cachedValueIndices) {
			const {type, values} = this
			const valueIndices = new Map<string, number>()
			values.forEach((value, i) => {
				//Convert value to bytes and then string for use as a map key
				const valueString = bufferString.toBinaryString(type.valueBuffer(value))
				if (valueIndices.has(valueString)) throw new Error('Value is repeated: ' + inspect(value))
				valueIndices.set(valueString, i) //so writing a value has constant-time lookup into the values array
			})
			this.cachedValueIndices = valueIndices
		}
		return this.cachedValueIndices
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.addAll(flexInt.makeValueBuffer(this.values.length))
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
	writeValue(buffer: AppendableBuffer, value: E): void {
		assert.isBuffer(buffer)
		const valueBuffer = this.type.valueBuffer(value)
		const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer))
		if (index === undefined) throw new Error('Not a valid enum value: ' + inspect(value))
		//Write the index to the requested value in the values array
		buffer.addAll(flexInt.makeValueBuffer(index))
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<E> {
		const {value: valueIndex, length} = readFlexInt(buffer, offset)
		const value = this.values[valueIndex] as E | undefined
		if (value === undefined) throw new Error(`Index ${valueIndex} is invalid`)
		return {value, length}
	}
	equals(otherType: unknown): boolean {
		if (!this.isSameType(otherType)) return false
		if (!this.type.equals(otherType.type)) return false
		if (this.values.length !== otherType.values.length) return false
		const otherIndices = otherType.valueIndices
		for (const [thisValue, thisIndex] of this.valueIndices) {
			if (otherIndices.get(thisValue) !== thisIndex) return false
		}
		return true
	}
}