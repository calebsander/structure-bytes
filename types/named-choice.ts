import assert from '../lib/assert'
import * as bufferString from '../lib/buffer-string'
import GrowableBuffer from '../lib/growable-buffer'
import {setPointers} from '../lib/pointers'
import {inspect} from '../lib/util-inspect'
import AbsoluteType from './absolute'
import StructType from './struct'

export interface NameAndType<E> {
	nameBuffer: ArrayBuffer
	type: StructType<E>
}
/**
 * A type storing a value of one of several fixed classes.
 * Each class is associated with a {@link StructType}
 * used to write values of instances of the class.
 * Unlike {@link ChoiceType}, read values specify the type
 * used to write them.
 * The list of possible types must contain at most 255 types.
 * {@link NamedChoiceType} is similar to {@link ChoiceType} in most respects.
 * @example
 * //Storing various barcode types
 * class QRCode {
 *   constructor(text) {
 *     this.text = text
 *   }
 * }
 * class UPC {
 *   constructor(number) {
 *     this.number = number
 *   }
 * }
 * let barcodeType = new sb.NamedChoiceType(new Map()
 *   .set(QRCode, new sb.StructType({
 *     text: new sb.StringType
 *   }))
 *   .set(UPC, new sb.StructType({
 *     number: new sb.UnsignedLongType
 *   }))
 * )
 * @extends Type
 * @inheritdoc
 */
export default class NamedChoiceType<E extends object> extends AbsoluteType<E> {
	static get _value() {
		return 0x58
	}
	readonly constructorTypes: NameAndType<E>[]
	readonly indexConstructors: Map<number, Function>
	/**
	 * @param {Map.<constructor, StructType>} types The mapping
	 * of constructors to associated types.
	 * Cannot contain more than 255 types.
	 * Values will be written using the type
	 * associated with the first constructor in the map
	 * of which they are an instance,
	 * so place higher priority types earlier.
	 * For example, if you wanted to be able to write
	 * the values of instances of a subclass and a superclass,
	 * put the subclass first so that all its fields
	 * are written, not just those inherited from the superclass.
	 */
	constructor(constructorTypes: Map<Function, StructType<E>>) {
		super()
		assert.instanceOf(constructorTypes, Map)
		try { assert.byteUnsignedInteger(constructorTypes.size) }
		catch (e) { assert.fail(String(constructorTypes.size) + ' types is too many') }
		this.indexConstructors = new Map
		this.constructorTypes = new Array(constructorTypes.size)
		const usedNames = new Set<string>()
		for (const [constructor, type] of constructorTypes) {
			assert.instanceOf(constructor, Function)
			const {name} = constructor
			assert(name !== '', 'Function does not have a name')
			assert(!usedNames.has(name), 'Function name "' + name + '" is repeated')
			usedNames.add(name)
			//Name must fit in 255 UTF-8 bytes
			const typeNameBuffer = bufferString.fromString(name)
			try { assert.byteUnsignedInteger(typeNameBuffer.byteLength) }
			catch (e) { assert.fail('Function name "' + name + '" is too long') }
			assert.instanceOf(type, StructType)
			const constructorIndex = this.indexConstructors.size
			this.indexConstructors.set(constructorIndex, constructor)
			this.constructorTypes[constructorIndex] = {nameBuffer: typeNameBuffer, type}
		}
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.add(this.constructorTypes.length)
			for (const {nameBuffer, type} of this.constructorTypes) { //eslint-disable-line no-unused-vars
				buffer.add(nameBuffer.byteLength)
				buffer.addAll(nameBuffer)
				type.addToBuffer(buffer)
			}
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type.
	 * The constructor name will be transfered to the read value.
	 * So, if you write using the type associated with {@link QRCode},
	 * the read value's constructor will also be named {@link "QRCode"}.
	 * If, however, you write an instance of a subclass of {@link QRCode},
	 * it will write as {@link QRCode} and the read value's constructor
	 * will be named {@link "QRCode"}.
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {*} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, new QRCode('abc')) //writes as QRCode
	 * type.writeValue(buffer, new UPC('0123')) //writes as UPC
	 */
	writeValue(buffer: GrowableBuffer, value: E, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Object)
		let writeIndex: number | undefined
		for (const [index, constructor] of this.indexConstructors) {
			if (value instanceof constructor) {
				writeIndex = index
				break
			}
		}
		if (writeIndex === undefined) throw new Error('No types matched: ' + inspect(value))
		buffer.add(writeIndex)
		const {type} = this.constructorTypes[writeIndex]
		type.writeValue(buffer, value, false)
		setPointers({buffer, root})
	}
	equals(otherType: any) {
		if (!super.equals(otherType)) return false
		const otherChoiceType = otherType as NamedChoiceType<any>
		if (this.constructorTypes.length !== otherChoiceType.constructorTypes.length) return false
		for (let i = 0; i < this.constructorTypes.length; i++) {
			const thisType = this.constructorTypes[i]
			const otherType = otherChoiceType.constructorTypes[i]
			if (!thisType.type.equals(otherType.type)) return false
			try { assert.equal(otherType.nameBuffer, thisType.nameBuffer) }
			catch (e) { return false }
		}
		return true
	}
}