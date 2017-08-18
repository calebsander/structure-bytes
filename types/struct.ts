import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

export interface StringIndexable {
	[key: string]: any
}
export interface StructField<E> {
	name: string
	type: Type<E>
	nameBuffer: ArrayBuffer
}
export type StructFields<E> = {
	[key in keyof E]: Type<E[key]>
}
/**
 * A type storing up to 255 named fields
 * @example
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   drowsiness: new sb.DoubleType
 * })
 * @extends Type
 * @inheritdoc
 */
export default class StructType<E extends StringIndexable> extends AbsoluteType<E> {
	static get _value() {
		return 0x51
	}
	readonly fields: StructField<any>[]
	/**
	 * @param {Object.<string, Type>} fields A mapping of field names to their types.
	 * There can be no more than 255 fields.
	 * Each field name must be at most 255 bytes long in UTF-8.
	 */
	constructor(fields: StructFields<E>) {
		super()
		assert.instanceOf(fields, Object)
		//Allow only 255 fields
		const fieldCount = Object.keys(fields).length
		try { assert.byteUnsignedInteger(fieldCount) }
		catch (e) { assert.fail(String(fieldCount) + ' fields is too many') }

		this.fields = new Array(fieldCount) //really a set, but we want ordering to be fixed so that type bytes are consistent
		let fieldIndex = 0
		for (const fieldName in fields) {
			if (!{}.hasOwnProperty.call(fields, fieldName)) continue
			//Name must fit in 255 UTF-8 bytes
			const fieldNameBuffer = bufferString.fromString(fieldName)
			try { assert.byteUnsignedInteger(fieldNameBuffer.byteLength) }
			catch (e) { assert.fail('Field name ' + fieldName + ' is too long') }
			//Type must be a Type
			const fieldType = fields[fieldName]
			try { assert.instanceOf(fieldType, AbstractType) }
			catch (e) { assert.fail(String(fieldType) + ' is not a valid field type') }
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
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.add(this.fields.length)
			for (const field of this.fields) {
				const {nameBuffer} = field
				buffer.add(nameBuffer.byteLength) //not using null-terminated string because length is only 1 byte
				buffer.addAll(nameBuffer)
				field.type.addToBuffer(buffer)
			}
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Object} value The value to write. Each field must have a valid value supplied.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, {
	 *   name: 'Papa',
	 *   age: 67,
	 *   drowsiness: 0.2
	 * })
	 */
	writeValue(buffer: GrowableBuffer, value: E, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Object)
		for (const field of this.fields) {
			const fieldValue = value[field.name]
			try { field.type.writeValue(buffer, fieldValue, false) }
			catch (writeError) {
				//Reporting that field is missing is more useful than, for example,
				//Saying "undefined is not an instance of Number"
				assert(fieldValue !== undefined, 'Value for field "' + field.name + '" missing')
				throw writeError //throw original error if field is defined, but just invalid
			}
		}
		setPointers({buffer, root})
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