import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import writeIterable from '../lib/write-iterable'
import AbsoluteType from './absolute'
import AbstractType from './abstract'
import Type from './type'

/**
 * A type storing a variable-size set of values of the same type
 * Works much like {@link ArrayType} except all values are {@link Set}s.
 * @example
 * //For storing some number of people
 * let personType = new sb.StructType({...})
 * let type = new sb.SetType(personType)
 * @extends ArrayType
 * @inheritdoc
 */
export default class SetType<E> extends AbsoluteType<Set<E>> {
	static get _value() {
		return 0x53
	}
	readonly type: Type<E>
	/**
	 * @param {Type} type The type of each element in the set
	 */
	constructor(type: Type<E>) {
		super()
		assert.instanceOf(type, AbstractType)
		this.type = type
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Set.<type>} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3))
	 */
	writeValue(buffer: GrowableBuffer, value: Set<E>, root = true) {
		assert.instanceOf(value, Set)
		writeIterable({type: this.type, buffer, value, length: value.size, root})
	}
	equals(otherType: any) {
		return super.equals(otherType) && this.type.equals((otherType as SetType<any>).type)
	}
}