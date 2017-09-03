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
 * Each class is associated with a [[StructType]]
 * used to write values of instances of the class.
 * Unlike [[ChoiceType]], read values specify the type
 * used to write them.
 * Be aware that the constructor of the read value is synthetic,
 * so it will not be the same as the constructor of the written value.
 * However, they will have the same name.
 * [[NamedChoiceType]] is similar to [[ChoiceType]] in other respects.
 * The list of possible types must contain at most 255 types.
 *
 * Example:
 * ````javascript
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
 * ````
 *
 * @param E The type of value this choice type can write.
 * If you provide, e.g. a `Type<A>` and a `Type<B>` and a `Type<C>`
 * to the constructor, `E` should be `A | B | C`.
 * In TypeScript, you have to declare this manually
 * unless all the value types are identical.
 */
export default class NamedChoiceType<E extends object> extends AbsoluteType<E> {
	static get _value() {
		return 0x58
	}
	/**
	 * The names of constructors and each's matching [[Type]]
	 */
	readonly constructorTypes: NameAndType<E>[]
	/**
	 * A map of constructor indices to constructors.
	 * Essentially an array.
	 */
	readonly indexConstructors: Map<number, Function>
	/**
	 * @param constructorTypes The mapping
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
			for (const {nameBuffer, type} of this.constructorTypes) {
				buffer
					.add(nameBuffer.byteLength)
					.addAll(nameBuffer)
				type.addToBuffer(buffer)
			}
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * let buffer = new GrowableBuffer
	 * barcodeType.writeValue(buffer, new QRCode('abc'))
	 * let readValue = sb.r.value({
	 *   type: barcodeType,
	 *   buffer: buffer.toBuffer()
	 * })
	 * console.log(readValue.constructor.name) //'QRCode'
	 * ````
	 * or
	 * ````javascript
	 * let buffer = new GrowableBuffer
	 * barcodeType.writeValue(buffer, new UPC('0123'))
	 * let readValue = sb.r.value({
	 *   type: barcodeType,
	 *   buffer: buffer.toBuffer()
	 * })
	 * console.log(readValue.constructor.name) //'UPC'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @param root Omit if used externally; only used internally
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
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
			const thisConstructor = this.constructorTypes[i]
			const otherConstructor = otherChoiceType.constructorTypes[i]
			if (!thisConstructor.type.equals(otherConstructor.type)) return false
			try { assert.equal(otherConstructor.nameBuffer, thisConstructor.nameBuffer) }
			catch (e) { return false }
		}
		return true
	}
}