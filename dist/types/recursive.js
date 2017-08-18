"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../lib/assert");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const pointers_1 = require("../lib/pointers");
const recursiveNesting = require("../lib/recursive-nesting");
const recursiveRegistry = require("../recursive-registry");
const absolute_1 = require("./absolute");
//Map of write buffers to maps of objects to their first written locations in the buffer
const recursiveLocations = new WeakMap();
//Map of write buffers to maps of names to ids
const recursiveIDs = new WeakMap();
/**
 * A type that can refer recursively to itself.
 * This is not a type in its own right, but allows you
 * to have some other type use itself in its definition.
 * Values that contain circular references will have the
 * references preserved after serialization and deserialization.
 * @example
 * //A binary tree of unsigned bytes
 * const treeType = new sb.RecursiveType('tree-node')
 * sb.registerType({
 *   type: new sb.StructType({
 *     left: new sb.OptionalType(treeType),
 *     value: new sb.UnsignedByteType,
 *     right: new sb.OptionalType(treeType)
 *   }),
 *   name: 'tree-node' //name must match name passed to RecursiveType constructor
 * })
 * @extends Type
 * @inheritdoc
 */
class RecursiveType extends absolute_1.default {
    /**
     * @param {string} name The name of the type,
     * as registered using {@link registerType}
     */
    constructor(name) {
        super();
        assert_1.default.instanceOf(name, String);
        this.name = name;
    }
    static get _value() {
        return 0x57;
    }
    get type() {
        const type = recursiveRegistry.getType(this.name);
        return type;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            let bufferRecursiveIDs = recursiveIDs.get(buffer);
            if (!bufferRecursiveIDs) {
                bufferRecursiveIDs = new Map;
                recursiveIDs.set(buffer, bufferRecursiveIDs); //look for existing translation into recursive ID
            }
            let recursiveID = bufferRecursiveIDs.get(this.name);
            const firstOccurence = recursiveID === undefined;
            if (firstOccurence) {
                recursiveID = bufferRecursiveIDs.size; //use the next number as the ID
                bufferRecursiveIDs.set(this.name, recursiveID);
            }
            buffer.addAll(flexInt.makeValueBuffer(recursiveID));
            if (firstOccurence) {
                //Keep track of how far we are inside writing recursive types (see how this is used in AbstractType.addToBuffer())
                recursiveNesting.increment(buffer);
                const { type } = this;
                type.addToBuffer(buffer);
                recursiveNesting.decrement(buffer);
            }
            return true;
        }
        /*istanbul ignore next*/
        return false;
    }
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
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
     */
    writeValue(buffer, value, root = true) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        let writeValue = true;
        let bufferRecursiveLocations = recursiveLocations.get(buffer);
        if (bufferRecursiveLocations) {
            const targetLocation = bufferRecursiveLocations.get(value);
            if (targetLocation !== undefined) {
                writeValue = false;
                buffer.add(0x00);
                const offset = buffer.length - targetLocation; //calculate offset to previous location
                buffer.addAll(flexInt.makeValueBuffer(offset));
            }
        }
        else {
            bufferRecursiveLocations = new Map;
            recursiveLocations.set(buffer, bufferRecursiveLocations);
        }
        if (writeValue) {
            buffer.add(0xFF);
            //Keep track of the location before writing the data so that this location can be referenced by sub-values
            bufferRecursiveLocations.set(value, buffer.length);
            const { type } = this;
            type.writeValue(buffer, value, false);
        }
        pointers_1.setPointers({ buffer, root });
    }
    equals(otherType) {
        return super.equals(otherType)
            && this.name === otherType.name;
    }
}
exports.default = RecursiveType;
