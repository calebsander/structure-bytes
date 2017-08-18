import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 * @example
 * //If you have a lot of numbers that fit in an unsigned byte
 * //but could conceivably have one that requires a long
 * let type = new sb.ChoiceType([
 *   new sb.UnsignedByteType,
 *   new sb.UnsignedLongType
 * ])
 * @extends Type
 * @inheritdoc
 */
export default class ChoiceType<E> extends AbsoluteType<E> {
	static get _value() {
		return 0x56
	}
	readonly types: Type<E>[]
	/**
	 * @param {Type[]} types The list of possible types.
	 * Cannot contain more than 255 types.
	 * Values will be written using the first type in the list
	 * that successfully writes the value,
	 * so place higher priority types earlier.
	 */
	constructor(types: Type<E>[]) {
		super()
		assert.instanceOf(types, Array)
		try { assert.byteUnsignedInteger(types.length) }
		catch (e) { assert.fail(String(types.length) + ' types is too many') }
		for (const type of types) assert.instanceOf(type, AbstractType)
		this.types = types
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.add(this.types.length)
			for (const type of this.types) type.addToBuffer(buffer)
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {*} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, 10) //writes as an unsigned byte
	 * type.writeValue(buffer, 1000) //writes as an unsigned long
	 */
	writeValue(buffer: GrowableBuffer, value: E, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		let success = false
		//Try to write value using each type in order until no error is thrown
		for (let i = 0; i < this.types.length; i++) {
			const type = this.types[i]
			const valueBuffer = new GrowableBuffer
			try { type.writeValue(valueBuffer, value, false) }
			catch (e) { continue }
			buffer.add(i)
			buffer.addAll(valueBuffer.toBuffer())
			success = true
			break
		}
		if (!success) assert.fail('No types matched: ' + inspect(value))
		setPointers({buffer, root})
	}
	equals(otherType: any) {
		if (!super.equals(otherType)) return false
		const otherChoiceType = otherType as ChoiceType<any>
		if (this.types.length !== otherChoiceType.types.length) return false
		for (let i = 0; i < this.types.length; i++) {
			if (!this.types[i].equals(otherChoiceType.types[i])) return false
		}
		return true
	}
}