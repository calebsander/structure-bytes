"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerType = exports.rewindBuffer = void 0;
const assert = require("../lib/assert");
const bufferString = require("../lib/buffer-string");
const flexInt = require("../lib/flex-int");
const read_util_1 = require("../lib/read-util");
const absolute_1 = require("./absolute");
const abstract_1 = require("./abstract");
//Map of write buffers to maps of binary strings to the location they were written
const pointers = new WeakMap();
//Map of read value buffers to maps of pointer types to maps of pointer values to read results
const pointerReads = new WeakMap();
function rewindBuffer(buffer) {
    const locations = pointers.get(buffer);
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
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value `ArrayBuffer`.
 * If the value has already been written, 1 to 2 bytes are
 * likely needed to write the pointer (more if values are far apart
 * in output buffer).
 * In comparison to without a pointer type, only 1 extra byte will
 * be used if the value has not yet been written to the output buffer.
 *
 * Example:
 * ````javascript
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DayType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * ````
 *
 * @param E The type of values that can be written
 * @param READ_E The type of values that will be read
 */
class PointerType extends abstract_1.default {
    /**
     * @param type The [[Type]] used to write the values being pointed to
     */
    constructor(type) {
        super();
        this.type = type;
        assert.instanceOf(type, absolute_1.default);
    }
    static get _value() {
        return 0x70;
    }
    addToBuffer(buffer) {
        /*istanbul ignore else*/
        if (super.addToBuffer(buffer)) {
            this.type.addToBuffer(buffer);
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
     * let louis = {
     *   dob: new Date(1437592284193),
     *   id: 9,
     *   name: 'Louis'
     * },
     * garfield = {
     *   dob: new Date(1437592284194),
     *   id: 17,
     *   name: 'Garfield'
     * }
     * let value = {
     *   leader: {
     *     dob: new Date(1437592284192),
     *     id: 10,
     *     name: 'Joe'
     *   },
     *   members: new Set([louis, garfield]),
     *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
     * }
     * tribeType.writeValue(buffer, value)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer, value) {
        assert.isBuffer(buffer);
        let bufferPointers = pointers.get(buffer);
        if (!bufferPointers) {
            //Initialize pointers map if it doesn't exist
            pointers.set(buffer, bufferPointers = new Map);
        }
        const valueBuffer = this.type.valueBuffer(value);
        const valueString = bufferString.toBinaryString(valueBuffer); //have to convert the buffer to a string because equivalent buffers are not ===
        const index = bufferPointers.get(valueString);
        const { length } = buffer;
        bufferPointers.set(valueString, length);
        if (index === undefined) {
            buffer
                .addAll(flexInt.makeValueBuffer(0))
                .addAll(valueBuffer);
        }
        else
            buffer.addAll(flexInt.makeValueBuffer(length - index));
    }
    consumeValue(bufferOffset) {
        const { buffer, offset } = bufferOffset;
        const offsetDiff = read_util_1.readFlexInt(bufferOffset);
        let bufferPointerReads = pointerReads.get(buffer);
        if (!bufferPointerReads) {
            pointerReads.set(buffer, bufferPointerReads = new Map);
        }
        let bufferTypePointerReads = bufferPointerReads.get(this);
        if (!bufferTypePointerReads) {
            bufferPointerReads.set(this, bufferTypePointerReads = new Map);
        }
        const location = offset - offsetDiff;
        let value = bufferTypePointerReads.get(location);
        if (value === undefined) {
            value = offsetDiff
                //This value does exist, but it was serialized by a different type
                ? this.consumeValue({ buffer, offset: location })
                //This value is serialized here instead
                : this.type.consumeValue(bufferOffset);
        }
        bufferTypePointerReads.set(offset, value);
        return value;
    }
    equals(otherType) {
        return this.isSameType(otherType) && this.type.equals(otherType.type);
    }
}
exports.PointerType = PointerType;
