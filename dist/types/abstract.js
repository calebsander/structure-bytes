"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = require("base64-js");
const sha_256_1 = require("../lib/sha-256");
const config_1 = require("../config");
const appendable_stream_1 = require("../lib/appendable-stream");
const assert_1 = require("../lib/assert");
const constants_1 = require("../lib/constants");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const recursiveNesting = require("../lib/recursive-nesting");
const APPENDABLES = [growable_buffer_1.default, appendable_stream_1.default];
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
        if (this.cachedTypeLocations) {
            if (!recursiveNesting.get(buffer)) {
                const location = this.cachedTypeLocations.get(buffer);
                if (location !== undefined) {
                    buffer
                        .add(constants_1.REPEATED_TYPE)
                        .addAll(flexInt.makeValueBuffer(buffer.length - location));
                    return false;
                }
            }
        }
        else
            this.cachedTypeLocations = new Map;
        this.cachedTypeLocations.set(buffer, buffer.length); //future uses of this type will be able to point to this position in the buffer
        buffer.add(this.constructor._value);
        return true;
    }
    toBuffer() {
        if (!this.cachedBuffer)
            this.cachedBuffer = this._toBuffer();
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
        try {
            assert_1.default.equal(otherType.constructor, this.constructor);
        }
        catch (e) {
            return false;
        }
        return true;
    }
    /**
     * Requires that the buffer be a [[GrowableBuffer]]
     * or [[AppendableStream]]
     * @private
     * @param buffer The value to assert is an [[AppendableBuffer]]
     */
    isBuffer(buffer) {
        assert_1.default.instanceOf(buffer, APPENDABLES);
    }
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @return An `ArrayBuffer` containing the type bytes
     */
    _toBuffer() {
        const buffer = new growable_buffer_1.default;
        this.addToBuffer(buffer);
        return buffer.toBuffer();
    }
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @return A hash of the buffer given by [[toBuffer]]
     */
    _getHash() {
        const bytes = new Uint8Array(sha_256_1.default(this.toBuffer()));
        return base64.fromByteArray(bytes);
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
