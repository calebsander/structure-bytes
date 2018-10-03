import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import {makeBaseValue, ReadResult} from '../lib/read-util'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import {Type} from './type'

/**
 * An object whose keys are strings,
 * i.e. any object
 */
export interface StringIndexable {
	[key: string]: any
}
export interface StructField {
	name: string
	type: Type<any>
	nameBuffer: ArrayBuffer
}
/**
 * Maps each key in `E` to a type capable of writing
 * the type of value stored by that key in `E`
 */
export type StructFields<E, READ_E extends E> = {
	[key in keyof E]: Type<E[key], READ_E[key]>
}
/**
 * A type storing up to 255 named fields.
 * Intended to model a generic JavaScript object,
 * whose field names are known in advance.
 * If field names are part of the value rather than the type,
 * use a [[MapType]] instead.
 *
 * The value passed into the constructor should resemble
 * the values to be written.
 * For example, to write `{a: 100, b: 'abc', c: false}`,
 * you could use:
 * ````javascript
 * new sb.StructType({
 *   a: new sb.UnsignedIntType,
 *   b: new sb.StringType,
 *   c: new sb.BooleanType
 * })
 * ````
 *
 * Example:
 * ````javascript
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   netWorth: new sb.FloatType
 * })
 * ````
 *
 * @param E The type of object values this type can write
 * @param READ_E The type of object values this type will read
 */
export class StructType<E extends StringIndexable, READ_E extends E = E> extends AbsoluteType<E, READ_E> {
	static get _value() {
		return 0x51
	}
	/**
	 * An array of the field names with their corresponding types.
	 * Fields are sorted lexicographically by name,
	 * so that passing in equivalent `fields` objects
	 * to the constructor always gives the same result.
	 * Field names' UTF-8 representations are also cached.
	 */
	readonly fields: StructField[]
	/**
	 * @param fields A mapping of field names to their types.
	 * There can be no more than 255 fields.
	 * Each field name must be at most 255 bytes long in UTF-8.
	 */
	constructor(fields: StructFields<E, READ_E>) {
		super()
		assert.instanceOf(fields, Object)
		//Allow only 255 fields
		const fieldCount = Object.keys(fields).length
		try { assert.byteUnsignedInteger(fieldCount) }
		catch { assert.fail(`${fieldCount} fields is too many`) }

		this.fields = new Array(fieldCount) //really a set, but we want ordering to be fixed so that type bytes are consistent
		let fieldIndex = 0
		for (const fieldName in fields) {
			if (!{}.hasOwnProperty.call(fields, fieldName)) continue
			//Name must fit in 255 UTF-8 bytes
			const fieldNameBuffer = bufferString.fromString(fieldName)
			try { assert.byteUnsignedInteger(fieldNameBuffer.byteLength) }
			catch { assert.fail(`Field name ${fieldName} is too long`) }
			//Type must be a Type
			const fieldType = fields[fieldName]
			try { assert.instanceOf(fieldType, AbstractType) }
			catch { assert.fail(inspect(fieldType) + ' is not a valid field type') }
			this.fields[fieldIndex] = {
				name: fieldName,
				type: fieldType,
				nameBuffer: fieldNameBuffer
			}
			fieldIndex++
		}
		//Sort by field name so field order is predictable
		this.fields.sort((a, b) => {
			if (a.name < b.name) return -1
			/*istanbul ignore else*/
			if (a.name > b.name) return 1
			else return 0 //should never occur since names are distinct
		})
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.add(this.fields.length)
			for (const field of this.fields) {
				const {nameBuffer} = field
				buffer
					.add(nameBuffer.byteLength) //not using null-terminated string because length is only 1 byte
					.addAll(nameBuffer)
				field.type.addToBuffer(buffer)
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
	 * type.writeValue(buffer, {
	 *   name: 'Gertrude',
	 *   age: 29,
	 *   netWorth: 1.2e6
	 * })
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: E) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Object)
		for (const field of this.fields) {
			const fieldValue = value[field.name]
			try { field.type.writeValue(buffer, fieldValue) }
			catch (writeError) {
				//Reporting that field is missing is more useful than, for example,
				//Saying "undefined is not an instance of Number"
				throw fieldValue === undefined
					? new Error(`Value for field "${field.name}" missing`)
					: writeError //throw original error if field is defined, but just invalid
			}
		}
	}
	consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: object): ReadResult<READ_E> {
		let length = 0
		const value = (baseValue || makeBaseValue(this)) as READ_E
		for (const field of this.fields) {
			const readField = field.type.consumeValue(buffer, offset + length)
			value[field.name] = readField.value
			length += readField.length
		}
		return {value, length}
	}
	equals(otherType: any) {
		if (!super.equals(otherType)) return false
		const otherStructType = otherType as StructType<any>
		if (this.fields.length !== otherStructType.fields.length) return false
		for (let field = 0; field < this.fields.length; field++) {
			const thisField = this.fields[field]
			const otherField = otherStructType.fields[field]
			if (!thisField.type.equals(otherField.type)) return false
			if (thisField.name !== otherField.name) return false
		}
		return true
	}
}