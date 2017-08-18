"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = require("base64-js");
const js_sha256_1 = require("js-sha256");
const config_1 = require("../config");
const assert_1 = require("../lib/assert");
const constants_1 = require("../lib/constants");
const flexInt = require("../lib/flex-int");
const growable_buffer_1 = require("../lib/growable-buffer");
const recursiveNesting = require("../lib/recursive-nesting");
class AbstractType {
    /**
     * Returns an unsigned byte value unique to this type class;
     * used to serialize the type
     */
    static get _value() {
        throw new Error('Generic Type has no value byte');
    }
    addToBuffer(buffer) {
        assert_1.default.instanceOf(buffer, growable_buffer_1.default);
        if (this.cachedTypeLocations) {
            if (!recursiveNesting.get(buffer)) {
                const location = this.cachedTypeLocations.get(buffer);
                if (location !== undefined) {
                    buffer.add(constants_1.REPEATED_TYPE);
                    buffer.addAll(flexInt.makeValueBuffer(buffer.length - location));
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
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @see Type#toBuffer
     * @return {external:ArrayBuffer} A Buffer containing the type bytes
     */
    _toBuffer() {
        const buffer = new growable_buffer_1.default;
        this.addToBuffer(buffer);
        return buffer.toBuffer();
    }
    getHash() {
        if (!this.cachedHash)
            this.cachedHash = this._getHash();
        return this.cachedHash;
    }
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @see Type#getHash
     * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
     */
    _getHash() {
        const hash = js_sha256_1.sha256.create();
        hash.update(this.toBuffer());
        const bytes = new Uint8Array(hash.arrayBuffer());
        return base64.fromByteArray(bytes);
    }
    getSignature() {
        if (!this.cachedSignature)
            this.cachedSignature = this._getSignature();
        return this.cachedSignature;
    }
    /**
     * Gets a signature string for the type, recomputed each time
     * @private
     * @see Type#getSignature
     * @return {string} a signature for the type
     */
    _getSignature() {
        return config_1.VERSION_STRING + this.getHash();
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
}
exports.default = AbstractType;