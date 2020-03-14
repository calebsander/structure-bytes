import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {makeBaseValue, ReadResult} from '../lib/read-util'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import {StringType} from './string'
import type {Type} from './type'

const stringType = new StringType

export interface StructField<E> {
	name: keyof E & string
	type: Type<any>
}
/**
 * Maps each key in `E` to a type capable of writing
 * the type of value stored by that key in `E`
 */
export type StructFields<E, READ_E extends E> = {
	[key in keyof E]: Type<E[key], READ_E[key]>
}
/**
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
export class StructType<E extends Record<string, any>, READ_E extends E = E> extends AbsoluteType<E, READ_E> {
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
	readonly fields: StructField<E>[]
	/**
	 * @param fields A mapping of field names to their types.
	 */
	constructor(fields: StructFields<E, READ_E>) {
		super()
		assert.instanceOf(fields, Object)

		this.fields = [] //really a set, but we want ordering to be fixed so that type bytes are consistent
		for (const name in fields) {
			if (!{}.hasOwnProperty.call(fields, name)) continue
			//Type must be a Type
			const type = fields[name]
			try { assert.instanceOf(type, AbstractType) }
			catch { throw new Error(inspect(type) + ' is not a valid field type') }
			this.fields.push({name, type})
		}
		//Sort by field name so field order is predictable
		this.fields.sort((a, b) => {
			if (a.name < b.name) return -1
			/*istanbul ignore else*/
			if (a.name > b.name) return +1
			return 0 //should never occur since names are distinct
		})
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.addAll(flexInt.makeValueBuffer(this.fields.length))
			for (const {name, type} of this.fields) {
				stringType.writeValue(buffer, name)
				type.addToBuffer(buffer)
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
		for (const {name, type} of this.fields) {
			const fieldValue = value[name]
			try { type.writeValue(buffer, fieldValue) }
			catch (writeError) {
				//Reporting that field is missing is more useful than, for example,
				//Saying "undefined is not an instance of Number"
				//tslint:disable-next-line:strict-type-predicates
				throw fieldValue === undefined
					? new Error(`Value for field "${name}" missing`)
					: writeError //throw original error if field is defined, but just invalid
			}
		}
	}
	consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: object): ReadResult<READ_E> {
		let length = 0
		const value = (baseValue ?? makeBaseValue(this)) as READ_E
		for (const {name, type} of this.fields) {
			const readField = type.consumeValue(buffer, offset + length)
			value[name] = readField.value
			length += readField.length
		}
		return {value, length}
	}
	equals(otherType: unknown): otherType is this {
		return super.equals(otherType)
			&& this.fields.length === otherType.fields.length
			&& this.fields.every(({name, type}, i) => {
				const otherFields = otherType.fields[i]
				return name === otherFields.name && type.equals(otherFields.type)
			})
	}
}