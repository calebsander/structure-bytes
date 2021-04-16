import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {readBooleanByte, ReadResult} from '../lib/read-util'
import {writeBooleanByte} from '../lib/write-util'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import type {Type} from './type'

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
 * @param READ_E The type of non-`null` read values
 */
export class OptionalType<E, READ_E extends E = E> extends AbsoluteType<E | null | undefined, READ_E | null> {
	static get _value(): number {
		return 0x60
	}
	/**
	 * @param type The [[Type]] used to write values
	 * if they are not `null` or `undefined`
	 */
	constructor(readonly type: Type<E, READ_E>) {
		super()
		assert.instanceOf(type, AbstractType)
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
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
	writeValue(buffer: AppendableBuffer, value: E | null | undefined): void {
		assert.isBuffer(buffer)
		const isNull = value === null || value === undefined
		writeBooleanByte(buffer, !isNull)
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (!isNull) this.type.writeValue(buffer, value!)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<READ_E | null> {
		const readNonNull = readBooleanByte(buffer, offset)
		const nonNull = readNonNull.value
		let {length} = readNonNull
		let value: READ_E | null
		if (nonNull) {
			const subValue = this.type.consumeValue(buffer, offset + length)
			;({value} = subValue)
			length += subValue.length
		}
		else value = null
		return {value, length}
	}
	equals(otherType: unknown): boolean {
		return this.isSameType(otherType) && this.type.equals(otherType.type)
	}
}