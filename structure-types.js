/*eslint-disable valid-jsdoc*/ //since root parameters shouldn't be documented

//This file contains definitions for all the types
//and their writing to bytes methods

const assert = require('./lib/assert')
const base64 = require('base64-js')
const bufferString = require('./lib/buffer-string')
const config = require('./config')
const flexInt = require('./lib/flex-int')
const sha256 = require('sha256')
const GrowableBuffer = require('./lib/growable-buffer')
let recursiveRegistry
function loadRecursiveRegistry() { //lazy require to avoid mutual dependence
	if (!recursiveRegistry) recursiveRegistry = require('./recursive-registry')
}
const strint = require('./lib/strint')
const util = require('util')
const {dividedByEight, modEight} = require('./lib/bit-math')

//Map of write buffers to maps of names to ids
const recursiveIDs = new WeakMap
//Map of write buffers to the current number of levels deep in recursive types they are
const recursiveNesting = new WeakMap
//Map of write buffers to maps of objects to their first written locations in the buffer
const recursiveLocations = new WeakMap
//Map of write buffers to maps of binary strings to sets of indices where pointers to the binary data must be written
const pointers = new WeakMap

//After writing all the values, it is necessary to insert all the values of pointer types
//This function should be called in writeValue() for every type that could have a subtype that is a pointer type
function setPointers(buffer, root) {
	if (root) { //ensure this only happens once
		const bufferPointers = pointers.get(buffer)
		if (bufferPointers) {
			for (const [binaryString, insertionIndices] of bufferPointers) { //find all the locations where pointers must be inserted
				const index = buffer.length //value is going to be appended to buffer, so it will start at buffer.length
				buffer.addAll(bufferString.fromBinaryString(binaryString)) //add raw data
				const indexBuffer = new ArrayBuffer(4)
				new DataView(indexBuffer).setUint32(0, index)
				//In each pointer location, set the bytes to be a pointer to the correct location
				for (const insertionIndex of insertionIndices) buffer.setAll(insertionIndex, indexBuffer)
			}
		}
	}
}

//Type byte indicating next 2 bytes are an unsigned short containing the location of the type
//The unsigned short is a negative offset from this type byte to the true location
const REPEATED_TYPE = 0xFF
//Stored to avoid constructing the string multiple times
const CACHED = 'cached'

/**
 * The superclass of each class representing a possible type.
 * This class should only be used to check if an object is a valid type.
 */
class Type {
	/**
	 * The type byte that uniquely identifies a type.
	 * Accessing this will throw an error on the {@link Type} class.
	 * @readonly
	 * @type {number}
	 */
	static get _value() {
		assert.fail('Generic Type has no value byte')
	}
	/**
	 * Appends the type information to a {@link GrowableBuffer}.
	 * All types start with the byte specified by {@link Type._value}.
	 * For the most primitive types, this implementation is sufficient.
	 * More complex types should override this method,
	 * invoking [super.addToBuffer()]{@link Type#addToBuffer} and then adding their own data if it returns true.
	 * @param {GrowableBuffer} buffer The buffer to append to
	 * @return {boolean} {@link false} if it wrote a pointer to a previous instance, {@link true} if it wrote the type byte. Intended to only be used internally.
	 */
	addToBuffer(buffer) {
		assert.instanceOf(buffer, GrowableBuffer)
		if (this.cachedTypeLocations) { //only bother checking if type has already been written if there are cached locations
			if (!recursiveNesting.get(buffer)) { //avoid referencing types that are ancestors of a recursive type because it creates infinite recursion on read
				const location = this.cachedTypeLocations.get(buffer)
				if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
					buffer.add(REPEATED_TYPE)
					buffer.addAll(flexInt.makeValueBuffer(buffer.length - location))
					return false
				}
			}
		}
		else this.cachedTypeLocations = new Map
		this.cachedTypeLocations.set(buffer, buffer.length) //future uses of this type will be able to point to this position in the buffer
		buffer.add(this.constructor._value)
		return true
	}
	/**
	 * Gets the type in buffer form, using a cached value if present.
	 * Since types are immutable, the result should never change from the cached value.
	 * @return {external:ArrayBuffer} A Buffer containing the type bytes
	 */
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer()
		return this.cachedBuffer
	}
	/**
	 * Generates the type buffer, recomputed each time
	 * @private
	 * @see Type#toBuffer
	 * @return {external:ArrayBuffer} A Buffer containing the type bytes
	 */
	_toBuffer() {
		const buffer = new GrowableBuffer
		this.addToBuffer(buffer)
		return buffer.toBuffer()
	}
	/**
	 * Gets an SHA256 hash of the type, using a cached value if present
	 * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
	 */
	getHash() {
		if (!this.cachedHash) this.cachedHash = this._getHash()
		return this.cachedHash
	}
	/**
	 * Gets an SHA256 hash of the type, recomputed each time
	 * @private
	 * @see Type#getHash
	 * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
	 */
	_getHash() {
		return base64.fromByteArray(sha256(this.toBuffer(), {asBytes: true}))
	}
	/**
	 * Gets a signature string for the type, using a cached value if present.
	 * This string encodes the specification version and the type hash.
	 * @return {string} a signature for the type
	 */
	getSignature() {
		if (!this.cachedSignature) this.cachedSignature = this._getSignature()
		return this.cachedSignature
	}
	/**
	 * Gets a signature string for the type, recomputed each time
	 * @private
	 * @see Type#getSignature
	 * @return {string} a signature for the type
	 */
	_getSignature() {
		return config.VERSION_STRING + this.getHash()
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {*} value The value to write
	 * @throws {Error} If called on the {@link Type} class
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) { //eslint-disable-line no-unused-vars
		assert.fail('Generic Type has no value representation')
	}
	/**
	 * Gets a {@link Buffer} containing the value in binary format.
	 * See this type's {@link writeValue()} documentation
	 * for acceptable values.
	 * @param {*} value The value to write
	 * @return {external:ArrayBuffer} a {@link Buffer} storing the value (assuming the type is known)
	 * @see Type#writeValue
	 */
	valueBuffer(value) {
		const buffer = new GrowableBuffer
		this.writeValue(buffer, value)
		return buffer.toBuffer()
	}
	/**
	 * Returns whether this type object represents the same type as another object
	 * @param {Type} otherType Another object to compare with
	 * @return {boolean} {@link true} iff the types have the same constructor and the same field values for fields that don't store cached results
	 */
	equals(otherType) {
		//Other type must be descended from the same class (this check will ensure that otherType is not null or undefined)
		try { assert.instanceOf(otherType, this.constructor) }
		catch (e) { return false }
		//Other type must have the same constructor
		try { assert.equal(otherType.constructor, this.constructor) }
		catch (e) { return false }
		//Each non-cached property should match
		for (const param in this) {
			if ({}.hasOwnProperty.call(this, param) && !param.startsWith(CACHED)) {
				try { assert.equal(otherType[param], this[param]) }
				catch (e) { return false }
			}
		}
		return true
	}
}

/**
 * A type that is not a {@link PointerType}.
 * Used internally to disallow creating double pointers.
 * @private
*/
class AbsoluteType extends Type {}

function strToNum(str) {
	if (str) { //avoid errors with undefined.constructor and null.constructor; also '' is invalid
		if (str.constructor === String) {
			const converted = Number(str)
			if (!isNaN(converted)) return converted
		}
	}
	return //returned if conversion failed
}

/**
 * A type storing an signed integer
 * @private
 */
class IntegerType extends AbsoluteType {}
/**
 * A type storing a 1-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class ByteType extends IntegerType {
	static get _value() {
		return 0x01
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(-128, value, 128, 'Value out of range')
		const byteBuffer = new ArrayBuffer(1)
		new DataView(byteBuffer).setInt8(0, value)
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class ShortType extends IntegerType {
	static get _value() {
		return 0x02
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(-32768, value, 32768, 'Value out of range')
		const byteBuffer = new ArrayBuffer(2)
		new DataView(byteBuffer).setInt16(0, value)
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing a 4-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class IntType extends IntegerType {
	static get _value() {
		return 0x03
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(-2147483648, value, 2147483648, 'Value out of range')
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setInt32(0, value)
		buffer.addAll(byteBuffer)
	}
}
const LONG_MAX = '9223372036854775807',
	LONG_MIN = '-9223372036854775808'
function writeLong(buffer, value) {
	assert.instanceOf(buffer, GrowableBuffer)
	assert.instanceOf(value, String)
	assert.assert(!(strint.gt(value, LONG_MAX) || strint.lt(value, LONG_MIN)), 'Value out of range')
	const upper = strint.div(value, strint.LONG_UPPER_SHIFT, true) //get upper signed int
	const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)) //get lower unsigned int
	const byteBuffer = new ArrayBuffer(8)
	const dataView = new DataView(byteBuffer)
	dataView.setInt32(0, Number(upper))
	dataView.setUint32(4, Number(lower))
	buffer.addAll(byteBuffer)
}
/**
 * A type storing an 8-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class LongType extends IntegerType {
	static get _value() {
		return 0x04
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (a base-10 string representation of an integer)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		writeLong(buffer, value)
	}
}
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
class BigIntType extends IntegerType {
	static get _value() {
		return 0x05
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (a base-10 string representation of an integer)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		value = strint.normalize(value) //throws if value is invalid
		const bytes = []
		if (!strint.eq(value, '0')) {
			while (strint.gt(value, '127') || strint.lt(value, '-128')) { //builds bytes in LE order
				const quotient = strint.div(value, strint.BYTE_SHIFT, true)
				const remainder = strint.sub(value, strint.mul(quotient, strint.BYTE_SHIFT))
				bytes.push(Number(remainder))
				value = quotient
			}
			bytes.push(Number(value))
		}
		buffer.addAll(flexInt.makeValueBuffer(bytes.length))
		const byteBuffer = new ArrayBuffer(bytes.length)
		const dataView = new DataView(byteBuffer)
		let offset = 1
		for (let i = bytes.length - 2; i >= 0; i--, offset++) dataView.setUint8(offset, bytes[i]) //write in reverse order to get BE
		if (bytes.length) dataView.setInt8(0, bytes[bytes.length - 1]) //highest byte is signed so it must be treated separately
		buffer.addAll(byteBuffer)
	}
}

/**
 * A type storing an unsigned integer
 * @private
 */
class UnsignedType extends AbsoluteType {}
/**
 * A type storing a 1-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedByteType extends UnsignedType {
	static get _value() {
		return 0x11
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(0, value, 0x100, 'Value out of range')
		const byteBuffer = new ArrayBuffer(1)
		new Uint8Array(byteBuffer)[0] = value
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing a 2-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedShortType extends UnsignedType {
	static get _value() {
		return 0x12
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(0, value, 0x10000, 'Value out of range')
		const byteBuffer = new ArrayBuffer(2)
		new DataView(byteBuffer).setUint16(0, value)
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing a 4-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x13
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(0, value, 0x100000000, 'Value out of range')
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setUint32(0, value)
		buffer.addAll(byteBuffer)
	}
}
const UNSIGNED_LONG_MAX = '18446744073709551615'
/**
 * A type storing an 8-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedLongType extends UnsignedType {
	static get _value() {
		return 0x14
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (a base-10 string representation of an integer)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		assert.assert(!(strint.gt(value, UNSIGNED_LONG_MAX) || strint.lt(value, '0')), 'Value out of range')
		const upper = strint.div(value, strint.LONG_UPPER_SHIFT) //get upper unsigned int
		const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)) //get lower unsigned int
		const byteBuffer = new ArrayBuffer(8)
		const dataView = new DataView(byteBuffer)
		dataView.setUint32(0, Number(upper))
		dataView.setUint32(4, Number(lower))
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
class BigUnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x15
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (a base-10 string representation of an integer)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		assert.assert(!strint.isNegative(value), 'Value out of range')
		const bytes = []
		if (!strint.eq(value, '0')) { //if value is 0, avoid adding a 0 byte
			while (strint.ge(value, strint.BYTE_SHIFT)) { //builds bytes in LE order
				const [quotient, remainder] = strint.quotientRemainderPositive(value, strint.BYTE_SHIFT)
				bytes.push(Number(remainder))
				value = quotient
			}
			bytes.push(Number(value))
		}
		buffer.addAll(flexInt.makeValueBuffer(bytes.length))
		const byteBuffer = new ArrayBuffer(bytes.length)
		const dataView = new DataView(byteBuffer)
		let offset = 0
		for (let i = bytes.length - 1; i >= 0; i--, offset++) dataView.setUint8(offset, bytes[i]) //write in reverse order to get BE
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing any unsigned integer
 * that can be represented precisely in a double
 * (from 0 to 9007199254740991 (2^53 - 1)).
 * Rather than having a fixed-length value representation,
 * more bytes are needed to represent larger values.
 * This is inspired by the UTF-8 format:
 * large values can be stored, but since most values
 * are small, fewer bytes are used in the typical case.<br>
 * <br>
 * The number of bytes required for numbers are as follows:
 * <table>
 *   <thead><tr><th>Number range</th><th>Bytes</th></tr></thead>
 *   <tbody>
 *     <tr><td>0 to 127</td><td>1</td></tr>
 *     <tr><td>128 to 16511</td><td>2</td></tr>
 *     <tr><td>16512 to 2113663</td><td>3</td></tr>
 *     <tr><td>2113664 to 270549119</td><td>4</td></tr>
 *     <tr><td>270549120 to 34630287487</td><td>5</td></tr>
 *     <tr><td>34630287488 to 4432676798591</td><td>6</td></tr>
 *     <tr><td>4432676798592 to 567382630219903</td><td>7</td></tr>
 *     <tr><td>567382630219904 to 9007199254740991</td><td>8</td></tr>
 *   </tbody>
 * </table>
 * @extends Type
 * @inheritdoc
 */
class FlexUnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x17
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write (between 0 and 9007199254740991)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		buffer.addAll(flexInt.makeValueBuffer(value))
	}
}

/**
 * A type storing some sort of time.
 * @private
 */
class ChronoType extends AbsoluteType {}
/**
 * A type storing a [Date]{@link external:Date} with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
class DateType extends ChronoType {
	static get _value() {
		return 0x1A
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:Date} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Date)
		writeLong(buffer, String(value.getTime()))
	}
}
const MILLIS_PER_DAY = 86400000,
	MILLIS_PER_MINUTE = 60000
/**
 * A type storing a specific day in history.
 * The value is stored as a 3-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
class DayType extends ChronoType {
	static get _value() {
		return 0x1B
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:Date} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Date)
		//Instead of taking value.getTime() / MILLIS_PER_DAY (which would act as if the date was measured at UTC),
		//we round down the date in the current time zone
		const flooredDate = new Date(value.getFullYear(), value.getMonth(), value.getDate())
		const day = (flooredDate.getTime() - flooredDate.getTimezoneOffset() * MILLIS_PER_MINUTE) / MILLIS_PER_DAY
		const byteBuffer = new ArrayBuffer(3)
		const dataView = new DataView(byteBuffer)
		dataView.setInt16(0, day >> 8)
		dataView.setUint8(2, day & 0xFF)
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing a specific time of day.
 * The value is stored as a 4-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
class TimeType extends ChronoType {
	static get _value() {
		return 0x1C
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:Date} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Date)
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setUint32(0, value.getTime() % MILLIS_PER_DAY)
		buffer.addAll(byteBuffer)
	}
}

/**
 * A type storing a [floating-point number]{@linkplain https://en.wikipedia.org/wiki/Floating_point}
 * @private
 */
class FloatingPointType extends AbsoluteType {}
/**
 * A type storing a 4-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.instanceOf(value, Number)
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setFloat32(0, value)
		buffer.addAll(byteBuffer)
	}
}
/**
 * A type storing an 8-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
class DoubleType extends FloatingPointType {
	static get _value() {
		return 0x21
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.instanceOf(value, Number)
		const byteBuffer = new ArrayBuffer(8)
		new DataView(byteBuffer).setFloat64(0, value)
		buffer.addAll(byteBuffer)
	}
}

/**
 * A type storing a {@link Boolean} value (a bit)
 * @extends Type
 * @inheritdoc
 */
class BooleanType extends AbsoluteType {
	static get _value() {
		return 0x30
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {boolean} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Boolean)
		if (value) buffer.add(0xFF) //all bits are set for good measure
		else buffer.add(0x00)
	}
}
//Writes an array of booleans for BooleanTupleType or BooleanArrayType
//The boolean at index 8a + b is in the bth MSB (0-indexed) of the ath byte
function writeBooleans(buffer, booleans) {
	assert.instanceOf(booleans, Array)
	const incompleteBytes = modEight(booleans.length) //whether the booleans take up a partial byte
	const bytes = dividedByEight(booleans.length) //floored, so need to add one if incompleteBytes
	let length
	if (incompleteBytes) length = bytes + 1
	else length = bytes
	const byteBuffer = new ArrayBuffer(length)
	const castBuffer = new Uint8Array(byteBuffer)
	for (let i = 0; i < booleans.length; i++) {
		const boolean = booleans[i]
		assert.instanceOf(boolean, Boolean)
		const bit = modEight(~modEight(i)) //7 - (i % 8)
		//Set desired bit, leaving the others unchanges
		if (boolean) castBuffer[dividedByEight(i)] |= 1 << bit
		else castBuffer[dividedByEight(i)] &= ~(1 << bit)
	}
	buffer.addAll(byteBuffer)
}
/**
 * A type storing a fixed-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link TupleType} for boolean arrays.
 * The length must be at most 255.
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
class BooleanTupleType extends AbsoluteType {
	static get _value() {
		return 0x31
	}
	/**
	 * @param {number} length The number of {@link Boolean}s in each value of this type.
	 * Must fit in a 1-byte unsigned integer.
	 */
	constructor(length) {
		super()
		assert.byteUnsignedInteger(length)
		this.length = length
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) buffer.add(this.length)
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Boolean[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Array)
		assert.assert(
			value.length === this.length,
			'Length does not match: expected ' + String(this.length) + ' but got ' + value.length
		)
		writeBooleans(buffer, value)
	}
}
/**
 * A type storing a variable-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link ArrayType} for boolean arrays.
 * @see BooleanType
 * @extends Type
 * @inheritdoc
 */
class BooleanArrayType extends AbsoluteType {
	static get _value() {
		return 0x32
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Boolean[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Array)
		buffer.addAll(flexInt.makeValueBuffer(value.length))
		writeBooleans(buffer, value)
	}
}

/**
 * A type storing a single UTF-8 character
 * @extends Type
 * @inheritdoc
 */
class CharType extends AbsoluteType {
	static get _value() {
		return 0x40
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (must be only 1 character long)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		assert.assert(value.length === 1, 'String must contain only 1 character')
		buffer.addAll(bufferString.fromString(value))
	}
}
/**
 * A type storing a string of UTF-8 characters, with no bound on length
 * @extends Type
 * @inheritdoc
 */
class StringType extends AbsoluteType {
	static get _value() {
		return 0x41
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, String)
		const valueBuffer = bufferString.fromString(value)
		buffer.addAll(valueBuffer)
		buffer.add(0) //add a null byte to indicate end
	}
}
/**
 * A type storing an array of bytes.
 * This is intended for data, e.g. a hash, that doesn't fit any other category.
 * @extends Type
 * @inheritdoc
 */
class OctetsType extends AbsoluteType {
	static get _value() {
		return 0x42
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:ArrayBuffer} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, ArrayBuffer)
		buffer.addAll(flexInt.makeValueBuffer(value.byteLength))
		buffer.addAll(value)
	}
}

/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 * @example
 * //For storing 5 4-byte unsigned integers
 * let type = new sb.TupleType({type: new sb.UnsignedIntType, length: 5})
 * @extends Type
 * @inheritdoc
 */
class TupleType extends AbsoluteType {
	static get _value() {
		return 0x50
	}
	/**
	 * @param {{type, length}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {number} params.length The number of elements in the tuple.
	 * Must fit in a 1-byte unsigned integer.
	 */
	constructor({type, length}) {
		super()
		assert.instanceOf(type, Type)
		assert.byteUnsignedInteger(length)
		this.type = type
		this.length = length
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.add(this.length)
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [10, 5, 101, 43, 889])
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Array)
		assert.assert(
			value.length === this.length,
			'Length does not match: expected ' + String(this.length) + ' but got ' + value.length
		)
		for (const instance of value) this.type.writeValue(buffer, instance, false)
		setPointers(buffer, root)
	}
}
//Stored in constants so that misspelling will result in an Error rather than undefined
const NAME = 'name',
	TYPE = 'type',
	NAME_BUFFER = 'buffer'
/**
 * A type storing up to 255 named fields
 * @example
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   drowsiness: new sb.DoubleType
 * })
 * @extends Type
 * @inheritdoc
 */
class StructType extends AbsoluteType {
	static get _value() {
		return 0x51
	}
	/**
	 * @param {Object.<string, Type>} fields A mapping of field names to their types.
	 * There can be no more than 255 fields.
	 * Each field name must be at most 255 bytes long in UTF-8.
	 */
	constructor(fields) {
		super()
		assert.instanceOf(fields, Object)
		//Allow only 255 fields
		let fieldCount = 0
		for (const fieldName in fields) {
			if ({}.hasOwnProperty.call(fields, fieldName)) fieldCount++
		}
		try { assert.byteUnsignedInteger(fieldCount) }
		catch (e) { assert.fail(String(fieldCount) + ' fields is too many') }

		this.fields = new Array(fieldCount) //really a set, but we want ordering to be fixed so that type bytes are consistent
		let fieldIndex = 0
		for (const fieldName in fields) {
			if (!{}.hasOwnProperty.call(fields, fieldName)) continue
			//Name must fit in 255 UTF-8 bytes
			const fieldNameBuffer = bufferString.fromString(fieldName)
			try { assert.byteUnsignedInteger(fieldNameBuffer.byteLength) }
			catch (e) { assert.fail('Field name ' + fieldName + ' is too long') }
			//Type must be a Type
			const fieldType = fields[fieldName]
			try { assert.instanceOf(fieldType, Type) }
			catch (e) { assert.fail(String(fieldType) + ' is not a valid field type') }
			this.fields[fieldIndex] = {
				[NAME]: fieldName,
				[TYPE]: fieldType,
				[NAME_BUFFER]: fieldNameBuffer
			}
			fieldIndex++
		}
		//Sort by field name so field order is predictable
		this.fields.sort((a, b) => { //eslint-disable-line array-callback-return
			if (a[NAME] < b[NAME]) return -1
			else if (a[NAME] > b[NAME]) return 1
		})
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			buffer.add(this.fields.length)
			for (const field of this.fields) {
				const nameBuffer = field[NAME_BUFFER]
				buffer.add(nameBuffer.byteLength) //not using null-terminated string because length is only 1 byte
				buffer.addAll(nameBuffer)
				field[TYPE].addToBuffer(buffer)
			}
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Object} value The value to write. Each field must have a valid value supplied.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, {
	 *   name: 'Papa',
	 *   age: 67,
	 *   drowsiness: 0.2
	 * })
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Object)
		for (const field of this.fields) {
			const fieldValue = value[field[NAME]]
			try { field[TYPE].writeValue(buffer, fieldValue, false) }
			catch (writeError) {
				//Reporting that field is missing is more useful than, for example,
				//Saying "undefined is not an instance of Number"
				assert.assert(fieldValue !== undefined, 'Value for field "' + field[NAME] + '" missing')
				throw writeError //throw original error if field is defined, but just invalid
			}
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a variable-length array of values of the same type
 * @example
 * //For storing some number of people in order
 * let personType = new sb.StructType({...})
 * let type = new sb.ArrayType(personType)
 * @extends Type
 * @inheritdoc
 */
class ArrayType extends AbsoluteType {
	static get _value() {
		return 0x52
	}
	/**
	 * @param {Type} type The type of each element in the array
	 */
	constructor(type) {
		super()
		assert.instanceOf(type, Type)
		this.type = type
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer)
	}
	/**
	 * Writes any iterable value to the buffer.
	 * Used by ArrayType and SetType.
	 * Appends value bytes to a {@link GrowableBuffer} according to the type.
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @private
	*/
	_writeValue({buffer, value, length, root}) {
		assert.instanceOf(buffer, GrowableBuffer)
		buffer.addAll(flexInt.makeValueBuffer(length))
		for (const instance of value) this.type.writeValue(buffer, instance, false)
		setPointers(buffer, root)
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [person1, person2, person3])
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Array)
		this._writeValue({buffer, value, length: value.length, root})
	}
}
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
class SetType extends ArrayType {
	static get _value() {
		return 0x53
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Set.<type>} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3))
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Set)
		this._writeValue({buffer, value, length: value.size, root})
	}
}
/**
 * A type storing a variable-size mapping of keys of one type to values of another
 * @example
 * //For storing friendships (a mapping of people to their set of friends)
 * let personType = new sb.StructType({...})
 * let type = new sb.MapType(
 *   personType,
 *   new sb.SetType(personType)
 * )
 * @extends Type
 * @inheritdoc
 */
class MapType extends AbsoluteType {
	static get _value() {
		return 0x54
	}
	/**
	 * @param {Type} keyType The type of each key in the map
	 * @param {Type} valueType The type of each value in the map
	 */
	constructor(keyType, valueType) {
		super()
		assert.instanceOf(keyType, Type)
		assert.instanceOf(valueType, Type)
		this.keyType = keyType
		this.valueType = valueType
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.keyType.addToBuffer(buffer)
			this.valueType.addToBuffer(buffer)
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Map.<keyType, valueType>} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * let friendMap = new Map
	 * friendMap.set(person1, new Set([person2, person3]))
	 * friendMap.set(person2, new Set([person1]))
	 * friendMap.set(person3, new Set([person1]))
	 * type.writeValue(buffer, friendMap)
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Map)
		buffer.addAll(flexInt.makeValueBuffer(value.size))
		for (const [mapKey, mapValue] of value) { //for each key-value pairing, write key and value
			this.keyType.writeValue(buffer, mapKey, false)
			this.valueType.writeValue(buffer, mapValue, false)
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 * @example
 * //Storing different species' characteristics
 * const HUMAN = {heightFt: 6, speedMph: 28}
 * const CHEETAH = {heightFt: 3, speedMph: 70}
 * let type = new sb.EnumType({
 *   type: new sb.StructType({
 *     heightFt: new sb.FloatType,
 *     speedMph: new sb.UnsignedByteType
 *   }),
 *   values: [HUMAN, CHEETAH]
 * })
 * @extends Type
 * @inheritdoc
 */
class EnumType extends Type {
	static get _value() {
		return 0x55
	}
	/**
	 * @param {{type, value}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {type[]} params.values The possible distinct values.
	 * Cannot contain more than 255 values.
	 * @throws {Error} If any value is invalid for {@link type}
	 */
	constructor({type, values}) {
		super()
		assert.instanceOf(type, AbsoluteType) //pointer types don't make sense because each value should be distinct
		assert.instanceOf(values, Array)
		//At most 255 values allowed
		try { assert.byteUnsignedInteger(values.length) }
		catch (e) { assert.fail(String(values.length) + ' values is too many') }

		const valueIndices = new Map
		for (let i = 0; i < values.length; i++) {
			const value = values[i]
			const valueString = bufferString.toBinaryString(type.valueBuffer(value)) //convert value to bytes and then string for use as a map key
			assert.assert(!valueIndices.has(valueString), 'Value is repeated: ' + util.inspect(value))
			valueIndices.set(valueString, i) //so writing a value has constant-time lookup into the values array
		}
		this.type = type
		this.values = values //used when reading to get constant-time lookup of value index into value
		this.valueIndices = valueIndices
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.add(this.valueIndices.size)
			for (const [valueBuffer, _] of this.valueIndices) buffer.addAll(bufferString.fromBinaryString(valueBuffer)) //eslint-disable-line no-unused-vars
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, CHEETAH)
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		const valueBuffer = new GrowableBuffer
		this.type.writeValue(valueBuffer, value, false)
		const index = this.valueIndices.get(bufferString.toBinaryString(valueBuffer.toBuffer()))
		assert.assert(index !== undefined, 'Not a valid enum value: ' + util.inspect(value))
		buffer.add(index) //write the index to the requested value in the values array
		setPointers(buffer, root)
	}
}
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 * @example
 * //If you have a lot of numbers that fit in an unsigned byte
 * //but could conceivably have one that requires a long
 * let type = new sb.ChoiceType([
 *   new sb.UnsignedByteType,
 *   new sb.UnsignedLongType
 * ])
 * @extends Type
 * @inheritdoc
 */
class ChoiceType extends AbsoluteType {
	static get _value() {
		return 0x56
	}
	/**
	 * @param {Type[]} types The list of possible types.
	 * Cannot contain more than 255 types.
	 * Values will be written using the first type in the list
	 * that successfully writes the value,
	 * so place higher priority types earlier.
	 */
	constructor(types) {
		super()
		assert.instanceOf(types, Array)
		try { assert.byteUnsignedInteger(types.length) }
		catch (e) { assert.fail(String(types.length) + ' types is too many') }
		for (const type of types) assert.instanceOf(type, Type)
		this.types = types
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			buffer.add(this.types.length)
			for (const type of this.types) type.addToBuffer(buffer)
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {*} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, 10) //writes as an unsigned byte
	 * type.writeValue(buffer, 1000) //writes as an unsigned long
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		let success = false
		//Try to write value using each type in order until no error is thrown
		for (let i = 0; i < this.types.length; i++) {
			const type = this.types[i]
			const valueBuffer = new GrowableBuffer
			try { type.writeValue(valueBuffer, value, false) }
			catch (e) { continue }
			buffer.add(i)
			buffer.addAll(valueBuffer.toBuffer())
			success = true
			break
		}
		assert.assert(success, 'No types matched: ' + util.inspect(value))
		setPointers(buffer, root)
	}
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
class NamedChoiceType extends AbsoluteType {
	static get _value() {
		return 0x58
	}
	/**
	 * @param {Map.<constructor, Type>} types The mapping
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
	constructor(constructorTypes) {
		super()
		assert.instanceOf(constructorTypes, Map)
		try { assert.byteUnsignedInteger(constructorTypes.size) }
		catch (e) { assert.fail(String(constructorTypes.size) + ' types is too many') }
		this.indexConstructors = new Map
		this.constructorTypes = new Array(constructorTypes.size)
		const usedNames = new Set
		for (const [constructor, type] of constructorTypes) {
			assert.instanceOf(constructor, Function)
			const name = constructor.name
			assert.assert(name, 'Function "' + String(name) + '" does not have a name')
			assert.assert(!usedNames.has(name), 'Function name "' + name + '" is repeated')
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
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			buffer.add(this.constructorTypes.length)
			for (const {nameBuffer, type} of this.constructorTypes) { //eslint-disable-line no-unused-vars
				buffer.add(nameBuffer.byteLength)
				buffer.addAll(nameBuffer)
				type.addToBuffer(buffer)
			}
		}
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
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Object)
		let writeIndex
		for (const [index, constructor] of this.indexConstructors) {
			if (value instanceof constructor) {
				writeIndex = index
				break
			}
		}
		assert.assert(writeIndex !== undefined, 'No types matched: ' + util.inspect(value))
		buffer.add(writeIndex)
		const {type} = this.constructorTypes[writeIndex]
		type.writeValue(buffer, value, false)
		setPointers(buffer, root)
	}
}
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
class RecursiveType extends AbsoluteType {
	static get _value() {
		return 0x57
	}
	/**
	 * @param {string} name The name of the type,
	 * as registered using {@link registerType}
	 */
	constructor(name) {
		super()
		assert.instanceOf(name, String)
		this.name = name
	}
	get type() {
		loadRecursiveRegistry()
		return recursiveRegistry.getType(this.name)
	}
	addToBuffer(buffer) {
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
			buffer.addAll(flexInt.makeValueBuffer(recursiveID))
			if (firstOccurence) { //if type has already been defined, don't redefine it
				const bufferRecursiveNesting = recursiveNesting.get(buffer) || 0
				recursiveNesting.set(buffer, bufferRecursiveNesting + 1) //keep track of how far we are inside writing recursive types (see how this is used in super.addToBuffer())
				this.type.addToBuffer(buffer)
				recursiveNesting.set(buffer, bufferRecursiveNesting)
			}
		}
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
		assert.instanceOf(buffer, GrowableBuffer)
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
			this.type.writeValue(buffer, value, false)
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a value of another type or {@link null} or {@link undefined}.
 * {@link null} and {@link undefined} are treated identically,
 * and reading either value will result in {@link null}.
 * @example
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({...})
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * @extends Type
 * @inheritdoc
 */
class OptionalType extends AbsoluteType {
	static get _value() {
		return 0x60
	}
	/**
	 * @param {Type} type The type of any non-{@link null} value
	 */
	constructor(type) {
		super()
		assert.instanceOf(type, Type)
		this.type = type
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer)
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {null|undefined|type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, {
	 *   title: 'Manager',
	 *   employee: person1
	 * })
	 * type.writeValue(buffer, {
	 *   title: 'Assistant Librarian',
	 *   employee: null
	 * })
	 * type.writeValue(buffer, {
	 *   title: 'Assistant Librarian'
	 * })
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		if (value === null || value === undefined) buffer.add(0x00)
		else {
			buffer.add(0xFF)
			this.type.writeValue(buffer, value, false)
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value [ArrayBuffer]{@link external:ArrayBuffer}.
 * Each time the value is written, it will use 4 bytes to write the pointer,
 * so you will only save space if the value is longer than 4 bytes and written more than once.
 * @example
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DateType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * @extends Type
 * @inheritdoc
 */
class PointerType extends Type {
	static get _value() {
		return 0x70
	}
	/**
	 * @param {Type} type The type of any value
	 */
	constructor(type) {
		super()
		assert.instanceOf(type, AbsoluteType)
		this.type = type
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer)
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
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
	 *   members: new Set().add(louis).add(garfield),
	 *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
	 * }
	 * tribeType.writeValue(buffer, value)
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		let bufferPointers = pointers.get(buffer)
		if (!bufferPointers) {
			bufferPointers = new Map //initialize pointers map if it doesn't exist
			pointers.set(buffer, bufferPointers)
		}
		const valueBuffer = new GrowableBuffer
		this.type.writeValue(valueBuffer, value, false)
		const valueString = bufferString.toBinaryString(valueBuffer.toBuffer()) //have to convert the buffer to a string because equivalent buffers are not ===
		const currentIndex = buffer.length
		const pointerLocations = bufferPointers.get(valueString)
		if (pointerLocations) pointerLocations.add(currentIndex)
		else bufferPointers.set(valueString, new Set([currentIndex])) //bufferPointers maps values to the set of indices that need to point to the value
		buffer.addAll(new ArrayBuffer(4)) //placeholder for pointer
		setPointers(buffer, root)
	}
}

module.exports = {
	Type,
	ByteType,
	ShortType,
	IntType,
	LongType,
	BigIntType,
	UnsignedByteType,
	UnsignedShortType,
	UnsignedIntType,
	UnsignedLongType,
	BigUnsignedIntType,
	FlexUnsignedIntType,
	DateType,
	DayType,
	TimeType,
	FloatType,
	DoubleType,
	BooleanType,
	BooleanTupleType,
	BooleanArrayType,
	CharType,
	StringType,
	OctetsType,
	TupleType,
	StructType,
	ArrayType,
	SetType,
	MapType,
	EnumType,
	ChoiceType,
	NamedChoiceType,
	RecursiveType,
	OptionalType,
	PointerType,
	REPEATED_TYPE,
	MILLIS_PER_DAY,
	MILLIS_PER_MINUTE
}