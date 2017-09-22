import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {makeBaseValue, readBooleanByte, readFlexInt, ReadResult} from '../lib/read-util'
import * as recursiveNesting from '../lib/recursive-nesting'
import * as recursiveRegistry from '../recursive-registry'
import {RegisterableType} from '../recursive-registry-type'
import AbsoluteType from './absolute'
import Type from './type'

//Map of write buffers to maps of objects to their first written locations in the buffer
const recursiveLocations = new WeakMap<AppendableBuffer, Map<any, number>>()
//Map of write buffers to maps of names to ids
const recursiveIDs = new WeakMap<AppendableBuffer, Map<string, number>>()
//Map of value buffers to maps of indices to read values for recursive types
const readRecursives = new WeakMap<ArrayBuffer, Map<number, any>>()

/**
 * A type that can refer recursively to itself.
 * This is not a type in its own right, but allows you
 * to have some other type use itself in its definition.
 * Values that contain circular references will have the
 * references preserved after serialization and deserialization.
 *
 * Note that it is impossible to create self-referencing types
 * any other way, due to the immutable nature of types.
 * Also, other types will infinitely recurse on writes with circular references.
 *
 * Recursive types must be of one of the following types:
 * - [[ArrayType]]
 * - [[MapType]]
 * - [[SetType]]
 * - [[StructType]]
 * - [[TupleType]]
 *
 * This is due to the way that recursive values are deserialized.
 * For example, say the value was created with the following code:
 * ````javascript
 * let selfType = new sb.RecursiveType('self-type')
 * sb.registerType({
 *   type: new sb.StructType({
 *     self: selfType
 *   }),
 *   name: 'self-type'
 * })
 * let self = {} //note that we had to give self a "base value" of {}
 * self.self = self
 * ````
 * In order to deserialize the value, we need to carry out the same process:
 * - Set the value to some mutable base value so we have a reference to it
 * - Read the value for the `self` field, which gives the base value
 * - Assign the result of the read to the `self` field, mutating the base value
 *
 * The base values used are as follows:
 * - `[]` for [[ArrayType]] and [[TupleType]]
 * - `new Map` for [[MapType]]
 * - `new Set` for [[SetType]]
 * - `{}` for [[StructType]]
 *
 * Base values for other types are harder to compute, which is why
 * they are not allowed as [[RecursiveType]]s.
 * You can always use another type by making it the sole field
 * of a [[StructType]].
 *
 * Example:
 * ````javascript
 * //A binary tree of unsigned bytes
 * let treeType = new sb.RecursiveType('tree-node')
 * sb.registerType({
 *   type: new sb.StructType({
 *     left: new sb.OptionalType(treeType),
 *     value: new sb.UnsignedByteType,
 *     right: new sb.OptionalType(treeType)
 *   }),
 *   name: 'tree-node' //name must match name passed to RecursiveType constructor
 * })
 * ````
 *
 * @param E The type of value this type can write
 * (presumably a recursive value)
 * @param READ_E The type of value this type will read
 */
export default class RecursiveType<E, READ_E extends E = E> extends AbsoluteType<E, READ_E> {
	static get _value() {
		return 0x57
	}
	/**
	 * The name passed into the constructor
	 */
	readonly name: string
	/**
	 * @param name The name of the type,
	 * as registered using [[registerType]]
	 */
	constructor(name: string) {
		super()
		assert.instanceOf(name, String)
		this.name = name
	}
	get type(): RegisterableType & Type<E, READ_E> {
		const type = recursiveRegistry.getType(this.name)
		return (type as RegisterableType & Type<E, READ_E>)
	}
	addToBuffer(buffer: AppendableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			let bufferRecursiveIDs = recursiveIDs.get(buffer)
			if (!bufferRecursiveIDs) {
				bufferRecursiveIDs = new Map
				recursiveIDs.set(buffer, bufferRecursiveIDs) //look for existing translation into recursive ID
			}
			let recursiveID = bufferRecursiveIDs.get(this.name)
			const firstOccurence = recursiveID === undefined
			if (firstOccurence) {
				recursiveID = bufferRecursiveIDs.size //use the next number as the ID
				bufferRecursiveIDs.set(this.name, recursiveID)
			}
			buffer.addAll(flexInt.makeValueBuffer(recursiveID!))
			if (firstOccurence) { //only define type if type has not already been defined
				//Keep track of how far we are inside writing recursive types (see how this is used in AbstractType.addToBuffer())
				recursiveNesting.increment(buffer)
				this.type.addToBuffer(buffer)
				recursiveNesting.decrement(buffer)
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
	 * treeType.writeValue(buffer, {
	 *   left: {
	 *     left: {
	 *       left: null,
	 *       value: 1,
	 *       right: null
	 *     },
	 *     value: 2,
	 *     right: {
	 *       left: null,
	 *       value: 3,
	 *       right: null
	 *     }
	 *   },
	 *   value: 4,
	 *   right: {
	 *     left: null,
	 *     value: 5,
	 *     right: {
	 *       left: null,
	 *       value: 6,
	 *       right: null
	 *     }
	 *   }
	 * })
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`;
	 * also throws if no type has been registered with this type's name
	 */
	writeValue(buffer: AppendableBuffer, value: E) {
		this.isBuffer(buffer)
		let writeValue = true
		let bufferRecursiveLocations = recursiveLocations.get(buffer)
		if (bufferRecursiveLocations) {
			const targetLocation = bufferRecursiveLocations.get(value)
			if (targetLocation !== undefined) { //value has already been written to the buffer
				writeValue = false
				buffer.add(0x00)
				const offset = buffer.length - targetLocation //calculate offset to previous location
				buffer.addAll(flexInt.makeValueBuffer(offset))
			}
		}
		else {
			bufferRecursiveLocations = new Map
			recursiveLocations.set(buffer, bufferRecursiveLocations)
		}
		if (writeValue) { //value has not yet been written to the buffer
			buffer.add(0xFF)
			//Keep track of the location before writing the data so that this location can be referenced by sub-values
			bufferRecursiveLocations.set(value, buffer.length)
			this.type.writeValue(buffer, value)
		}
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<READ_E> {
		const explicit = readBooleanByte(buffer, offset)
		let {length} = explicit
		let value: READ_E
		if (explicit.value) {
			value = makeBaseValue(this.type)
			let bufferReadRecursives = readRecursives.get(buffer)
			if (!bufferReadRecursives) {
				bufferReadRecursives = new Map
				readRecursives.set(buffer, bufferReadRecursives)
			}
			bufferReadRecursives.set(offset + length, value)
			length += this.type.consumeValue(buffer, offset + length, value).length
		}
		else {
			const indexOffset = readFlexInt(buffer, offset + length)
			const target = offset + length - indexOffset.value
			const readValue = readRecursives.get(buffer)!.get(target) as READ_E | undefined
			if (!readValue) throw new Error('Cannot find target at ' + String(target))
			value = readValue
			length += indexOffset.length
		}
		return {value, length}
	}
	equals(otherType: any) {
		return super.equals(otherType)
			&& this.name === (otherType as RecursiveType<any>).name
	}
}