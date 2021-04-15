"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursiveType = exports.rewindBuffer = void 0;
const assert = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const recursiveNesting = require("../lib/recursive-nesting");
const write_util_1 = require("../lib/write-util");
const recursiveRegistry = require("../recursive-registry");
const abstract_1 = require("./abstract");
//Map of write buffers to maps of objects to their first written locations in the buffer
const recursiveLocations = new WeakMap();
//Map of write buffers to maps of names to ids
const recursiveIDs = new WeakMap();
//Map of value buffers to maps of indices to read values for recursive types
const readRecursives = new WeakMap();
function rewindBuffer(buffer) {
    const locations = recursiveLocations.get(buffer);
    if (locations) {
        const { length } = buffer;
        for (const [value, index] of locations) {
            if (index >= length)
                locations.delete(value);
        }
    }
}
exports.rewindBuffer = rewindBuffer;
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
 * selfType.setType(new sb.StructType({
 *   self: selfType
 * }))
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
 * treeType.setType(new sb.StructType({
 *   left: new sb.OptionalType(treeType),
 *   value: new sb.UnsignedByteType,
 *   right: new sb.OptionalType(treeType)
 * }))
 * ````
 *
 * @param E The type of value this type can write
 * (presumably a recursive value)
 * @param READ_E The type of value this type will read
 */
class RecursiveType extends abstract_1.default {
    /**
     * @param name The name of the type,
     * as registered using [[registerType]]
     */
    constructor(name) {
        super();
        this.name = name;
        assert.instanceOf(name, String);
    }
    static get _value() {
        return 0x57;
    }
    get type() {
        return recursiveRegistry.getType(this.name);
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            let bufferRecursiveIDs = recursiveIDs.get(buffer);
            if (!bufferRecursiveIDs) {
                recursiveIDs.set(buffer, bufferRecursiveIDs = new Map);
            }
            let recursiveID = bufferRecursiveIDs.get(this.name); //look for existing translation into recursive ID
            const firstOccurence = recursiveID === undefined;
            if (firstOccurence) {
                //Use the next number as the ID
                bufferRecursiveIDs.set(this.name, recursiveID = bufferRecursiveIDs.size);
            }
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            buffer.addAll(flexInt.makeValueBuffer(recursiveID));
            if (firstOccurence) { //only define type if type has not already been defined
                //Keep track of how far we are inside writing recursive types (see how this is used in AbstractType.addToBuffer())
                recursiveNesting.increment(buffer);
                this.type.addToBuffer(buffer);
                recursiveNesting.decrement(buffer);
            }
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * treeType.writeValue(buffer, {
     *   left: {
     *     left: {value: 1},
     *     value: 2,
     *     right: {value: 3}
     *   },
     *   value: 4,
     *   right: {
     *     value: 5,
     *     right: {value: 6}
     *   }
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`;
     * also throws if no type has been registered with this type's name
     */
    writeValue(buffer, value) {
        this.isBuffer(buffer);
        let bufferRecursiveLocations = recursiveLocations.get(buffer);
        if (bufferRecursiveLocations) {
            const targetLocation = bufferRecursiveLocations.get(value);
            if (targetLocation !== undefined) { //value has already been written to the buffer
                write_util_1.writeBooleanByte(buffer, false)
                    //calculate offset to previous location
                    .addAll(flexInt.makeValueBuffer(buffer.length - targetLocation));
                return;
            }
        }
        else
            recursiveLocations.set(buffer, bufferRecursiveLocations = new Map);
        //Value has not yet been written to the buffer
        write_util_1.writeBooleanByte(buffer, true);
        //Keep track of the location before writing the data so that this location can be referenced by sub-values
        bufferRecursiveLocations.set(value, buffer.length);
        try {
            this.type.writeValue(buffer, value);
        }
        catch (e) {
            bufferRecursiveLocations.delete(value);
            throw e;
        }
    }
    consumeValue(buffer, offset) {
        let bufferReadRecursives = readRecursives.get(buffer);
        const readExplicit = read_util_1.readBooleanByte(buffer, offset);
        const explicit = readExplicit.value;
        let { length } = readExplicit;
        let value;
        if (explicit) {
            value = read_util_1.makeBaseValue(this.type);
            if (!bufferReadRecursives) {
                readRecursives.set(buffer, bufferReadRecursives = new Map);
            }
            bufferReadRecursives.set(offset + length, value);
            length += this.type.consumeValue(buffer, offset + length, value).length;
        }
        else {
            const indexOffset = read_util_1.readFlexInt(buffer, offset + length);
            const target = offset + length - indexOffset.value;
            const readValue = bufferReadRecursives && bufferReadRecursives.get(target);
            if (!readValue)
                throw new Error(`Cannot find target at ${target}`);
            value = readValue;
            length += indexOffset.length;
        }
        return { value, length };
    }
    equals(otherType) {
        return this.isSameType(otherType) && this.name === otherType.name;
    }
    /**
     * An alternative to [[registerType]],
     * to avoid writing the type's name twice.
     * Please use this instead of [[registerType]].
     *
     * So this
     * ````javascript
     * let type = new sb.RecursiveType('abc')
     * sb.registerType({
     *   type: new sb.StructType({
     *     //...
     *   }),
     *   name: 'abc'
     * })
     * ````
     * becomes
     * ````javascript
     * let type = new sb.RecursiveType('abc')
     * type.setType(new sb.StructType({
     *   //...
     * }))
     * ````
     * @param type The type to register
     */
    setType(type) {
        recursiveRegistry.registerType({ type, name: this.name });
    }
}
exports.RecursiveType = RecursiveType;
