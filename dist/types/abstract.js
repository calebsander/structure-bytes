"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = require("base64-js");
const sha_256_1 = require("../lib/sha-256");
const config_1 = require("../config");
const appendable_stream_1 = require("../lib/appendable-stream");
const assert = require("../lib/assert");
const constants_1 = require("../lib/constants");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const recursiveNesting = require("../lib/recursive-nesting");
/**
 * The superclass of all [[Type]] classes
 * in this package
 */
class AbstractType {
    /**
     * Returns an unsigned byte value unique to this type class;
     * used to serialize the type
     */
    static get _value() {
        throw new Error('Generic Type has no value byte');
    }
    addToBuffer(buffer) {
        this.isBuffer(buffer);
        if (this.cachedTypeLocations) { //only bother checking if type has already been written if there are cached locations
            if (!recursiveNesting.get(buffer)) { //avoid referencing types that are ancestors of a recursive type because it creates infinite recursion on read
                const location = this.cachedTypeLocations.get(buffer);
                if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
                    // TODO: use most recent location
                    buffer
                        .add(constants_1.REPEATED_TYPE)
                        .addAll(flexInt.makeValueBuffer(buffer.length - location));
                    return false;
                }
            }
        }
        else
            this.cachedTypeLocations = new WeakMap;
        this.cachedTypeLocations.set(buffer, buffer.length); //future uses of this type will be able to point to this position in the buffer
        buffer.add(this.constructor._value);
        return true;
    }
    toBuffer() {
        if (!this.cachedBuffer)
            this.cachedBuffer = this._toBuffer();
        if (this.cachedBuffer instanceof Uint8Array) {
            this.cachedBuffer = growable_buffer_1.toArrayBuffer(this.cachedBuffer);
        }
        return this.cachedBuffer;
    }
    getHash() {
        if (!this.cachedHash)
            this.cachedHash = this._getHash();
        return this.cachedHash;
    }
    getSignature() {
        if (!this.cachedSignature)
            this.cachedSignature = this._getSignature();
        return this.cachedSignature;
    }
    valueBuffer(value) {
        const buffer = new growable_buffer_1.default;
        this.writeValue(buffer, value);
        return buffer.toBuffer();
    }
    readValue(valueBuffer, offset = 0) {
        assert.instanceOf(valueBuffer, [ArrayBuffer, Uint8Array]);
        assert.instanceOf(offset, Number);
        const { buffer, byteOffset, byteLength } = growable_buffer_1.asUint8Array(valueBuffer);
        const { value, length } = this.consumeValue(buffer, byteOffset + offset);
        if (offset + length !== byteLength) {
            throw new Error('Did not consume all of buffer');
        }
        return value;
    }
    /*
        For types that don't take any parameters, this is a sufficient equality check
        Could also implement this by checking whether the 2 types' binary representations match,
        but it is faster if we short-circuit when any fields don't match
    */
    equals(otherType) {
        //Checks that otherType is not null or undefined, so constructor property exists
        if (!otherType)
            return false;
        //Other type must have the same constructor
        return this.constructor === otherType.constructor;
    }
    /**
     * Requires that the buffer be a [[GrowableBuffer]]
     * or [[AppendableStream]]
     * @private
     * @param buffer The value to assert is an [[AppendableBuffer]]
     */
    isBuffer(buffer) {
        assert.instanceOf(buffer, [appendable_stream_1.default, growable_buffer_1.default]);
    }
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @return An `ArrayBuffer` containing the type bytes
     */
    _toBuffer() {
        const buffer = new growable_buffer_1.default;
        this.addToBuffer(buffer);
        return buffer.toUint8Array();
    }
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @return A hash of the buffer given by [[toBuffer]]
     */
    _getHash() {
        if (!this.cachedBuffer)
            this.cachedBuffer = this._toBuffer();
        return base64.fromByteArray(new Uint8Array(sha_256_1.default(growable_buffer_1.asUint8Array(this.cachedBuffer))));
    }
    /**
     * Gets a signature string for the type, recomputed each time,
     * based on the `structure-bytes` protocol version and the type hash
     * @private
     * @return A signature for the type
     */
    _getSignature() {
        return config_1.VERSION_STRING + this.getHash();
    }
}
exports.default = AbstractType;
