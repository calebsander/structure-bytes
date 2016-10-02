/*eslint-disable valid-jsdoc*/ //since root parameters shouldn't be documented

//For use with browserify
if (__dirname === '/') __dirname = ''

//This file contains definitions for all the types
//and their writing to bytes methods

const assert = require(__dirname + '/lib/assert.js')
const base64 = require('base64-js')
const bufferString = require(__dirname + '/lib/buffer-string.js')
const config = require(__dirname + '/config.js')
const sha256 = require('sha256')
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js')
let recursiveRegistry
function loadRecursiveRegistry() {
	if (recursiveRegistry === undefined) recursiveRegistry = require(__dirname + '/recursive-registry.js') //lazy require to avoid mutual dependence
}
const strint = require(__dirname + '/lib/strint.js')
const util = require('util')
const {dividedByEight, modEight} = require(__dirname + '/lib/bit-math.js')

//Since most things with length store it in a 32-bit unsigned integer,
//this utility function makes the creation of that buffer easier
function lengthBuffer(length) {
	const buffer = new ArrayBuffer(4)
	new DataView(buffer).setUint32(0, length)
	return buffer
}
//After writing all the values, it is necessary to insert all the values of pointer types
//This function should be called in writeValue() for every type that could have a subtype that is a pointer type
function setPointers(buffer, root) {
	if (root) { //ensure this only happens once
		if (buffer.pointers) {
			for (const [binaryString, insertionIndices] of buffer.pointers) { //find all the locations where pointers must be inserted
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
	 * Recursive types should override this method,
	 * invoking [super.addToBuffer()]{@link Type#addToBuffer} and then adding their own data if it returns true.
	 * @param {GrowableBuffer} buffer The buffer to append to
	 * @return {boolean} {@link false} if it wrote a pointer to a previous instance, {@link true} if it wrote the type byte. Intended to only be used internally.
	 */
	addToBuffer(buffer) {
		assert.instanceOf(buffer, GrowableBuffer)
		if (this.cachedTypeLocations) { //only bother checking if type has already been written if there are cached locations
			if (!buffer.recursiveNesting) { //avoid referencing types that are ancestors of a recursive type because it creates infinite recursion on read
				const location = this.cachedTypeLocations.get(buffer)
				if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
					buffer.add(REPEATED_TYPE)
					const offsetBuffer = new ArrayBuffer(2)
					try { //error will be thrown if offset didn't fit in a 2-byte integer, so fall through to explicitly writing the bytes
						new DataView(offsetBuffer).setUint16(0, buffer.length - location)
						buffer.addAll(offsetBuffer)
						return false
					}
					catch (e) {}
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
	 * @abstract
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
	if (strint.gt(value, LONG_MAX) || strint.lt(value, LONG_MIN)) assert.fail('Value out of range')
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
 * A type storing an arbitrary precision signed integer
 * (up to 65535 bytes of precision).
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
			assert.twoByteUnsignedInteger(bytes.length)
		}
		const byteBuffer = new ArrayBuffer(2 + bytes.length)
		const dataView = new DataView(byteBuffer)
		dataView.setUint16(0, bytes.length) //use 2 bytes to store the number of bytes in the value
		let offset = 3
		for (let i = bytes.length - 2; i > -1; i--, offset++) dataView.setUint8(offset, bytes[i]) //write in reverse order to get BE
		if (bytes.length) dataView.setInt8(2, bytes[bytes.length - 1]) //highest byte is signed so it must be treated separately
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
		if (strint.gt(value, UNSIGNED_LONG_MAX) || strint.lt(value, '0')) assert.fail('Value out of range')
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
 * A type storing an arbitrary precision unsigned integer
 * (up to 65535 bytes of precision).
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
		if (strint.isNegative(value)) assert.fail('Value out of range')
		const bytes = []
		if (!strint.eq(value, '0')) { //if value is 0, avoid adding a 0 byte
			while (strint.ge(value, strint.BYTE_SHIFT)) { //builds bytes in LE order
				const [quotient, remainder] = strint.quotientRemainderPositive(value, strint.BYTE_SHIFT)
				bytes.push(Number(remainder))
				value = quotient
			}
			bytes.push(Number(value))
			assert.twoByteUnsignedInteger(bytes.length)
		}
		const byteBuffer = new ArrayBuffer(2 + bytes.length)
		const dataView = new DataView(byteBuffer)
		dataView.setUint16(0, bytes.length) //use 2 bytes to store the number of bytes in the value
		let offset = 2
		for (let i = bytes.length - 1; i > -1; i--, offset++) dataView.setUint8(offset, bytes[i]) //write in reverse order to get BE
		buffer.addAll(byteBuffer)
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
 * A type storing a fixed-length array of {@link Boolean} values
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
	 * @param {number} length The number of {@link Boolean}s in each value of this type
	 */
	constructor(length) {
		super()
		assert.fourByteUnsignedInteger(length)
		this.length = length
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) buffer.addAll(lengthBuffer(this.length))
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
		if (value.length !== this.length) assert.fail('Length does not match')
		writeBooleans(buffer, value)
	}
}
/**
 * A type storing a variable-length array of {@link Boolean} values
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
		assert.fourByteUnsignedInteger(value.length)
		buffer.addAll(lengthBuffer(value.length))
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
		buffer.add(0) //add a null byte to make clear where the end is
	}
}
/**
 * A type storing an array of bytes.
 * This is intended for data, e.g. a hash, that doesn't fit any other category.
 * The number of bytes must fit in a 4-byte unsigned integer.
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
		assert.fourByteUnsignedInteger(value.byteLength)
		buffer.addAll(lengthBuffer(value.byteLength))
		buffer.addAll(value)
	}
}

/**
 * A type storing a fixed-length array of values of the same type.
 * The length must fit in a 4-byte unsigned integer.
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
	 * @param {number} params.length The number of elements in the tuple
	 * Must fit in a 4-byte unsigned integer.
	 */
	constructor({type, length}) {
		super()
		assert.instanceOf(type, Type)
		assert.fourByteUnsignedInteger(length)
		this.type = type
		this.length = length
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer)
			buffer.addAll(lengthBuffer(this.length))
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
		if (value.length !== this.length) {
			assert.fail('Length does not match: expected ' + String(this.length) + ' but got ' + value.length)
		}
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
			if (fieldValue === undefined) assert.fail('Value for field ' + field[NAME] + ' missing')
			field[TYPE].writeValue(buffer, fieldValue, false)
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a variable-length array of values of the same type.
 * The length of any value must fit in a 4-byte unsigned integer.
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
	 * @param {type[]} value The value to write. Length of the array must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @private
	*/
	_writeValue(buffer, value, root) {
		assert.instanceOf(buffer, GrowableBuffer)
		const length = value.length || value.size
		assert.fourByteUnsignedInteger(length)
		buffer.addAll(lengthBuffer(length))
		for (const instance of value) this.type.writeValue(buffer, instance, false)
		setPointers(buffer, root)
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write. Length of the array must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [person1, person2, person3])
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Array)
		this._writeValue(buffer, value, root)
	}
}
/**
 * A type storing a variable-size set of values of the same type.
 * The size of any value must fit in a 4-byte unsigned integer.
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
	 * @param {Set.<type>} value The value to write. Size of the set must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3))
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Set)
		this._writeValue(buffer, value, root)
	}
}
/**
 * A type storing a variable-size mapping of keys of one type to values of another.
 * The size of any map must fit in a 4-byte unsigned integer.
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
	 * @param {Map.<keyType, valueType>} value The value to write. Size of the map must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * let friendMap = new Map
	 * friendMap.set(person1, new Set().add(person2).add(person3))
	 * friendMap.set(person2, new Set([person1]))
	 * friendMap.set(person3, new Set([person1]))
	 * type.writeValue(buffer, friendMap)
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Map)
		assert.fourByteUnsignedInteger(value.size)
		buffer.addAll(lengthBuffer(value.size))
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
class ChoiceType extends Type {
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
		if (!success) assert.fail('No types matched: ' + util.inspect(value))
		setPointers(buffer, root)
	}
}
class RecursiveType extends AbsoluteType {
	static get _value() {
		return 0x57
	}
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
			let recursiveID
			if (buffer.recursiveIDs) recursiveID = buffer.recursiveIDs.get(this.name)
			else buffer.recursiveIDs = new Map
			const firstOccurence = recursiveID === undefined
			if (firstOccurence) {
				recursiveID = buffer.recursiveIDs.size
				assert.twoByteUnsignedInteger(recursiveID)
				buffer.recursiveIDs.set(this.name, recursiveID)
			}
			const idBuffer = new ArrayBuffer(2)
			new DataView(idBuffer).setUint16(0, recursiveID)
			buffer.addAll(idBuffer)
			if (firstOccurence) {
				buffer.recursiveNesting = (buffer.recursiveNesting || 0) + 1
				this.type.addToBuffer(buffer)
				buffer.recursiveNesting--
			}
		}
	}
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		let writeValue = true
		if (buffer.recursiveLocations) {
			const targetLocation = buffer.recursiveLocations.get(value)
			if (targetLocation !== undefined) {
				writeValue = false
				buffer.add(0x00)
				const offset = buffer.length - targetLocation
				assert.fourByteUnsignedInteger(offset)
				const offsetBuffer = new ArrayBuffer(4)
				new DataView(offsetBuffer).setUint32(0, offset)
				buffer.addAll(offsetBuffer)
			}
		}
		else buffer.recursiveLocations = new Map
		if (writeValue) {
			buffer.add(0xFF)
			buffer.recursiveLocations.set(value, buffer.length)
			this.type.writeValue(buffer, value, false)
		}
		setPointers(buffer, root)
	}
}
/**
 * A type storing a value of another type or {@link null}
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
	 * @param {null|type} value The value to write
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
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer)
		if (value === null) buffer.add(0x00)
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
		if (!buffer.pointers) buffer.pointers = new Map //initialize pointers map if it doesn't exist
		const valueBuffer = new GrowableBuffer
		this.type.writeValue(valueBuffer, value, false)
		const valueString = bufferString.toBinaryString(valueBuffer.toBuffer()) //have to convert the buffer to a string because equivalent buffers are not ===
		const currentIndex = buffer.length
		const pointerLocations = buffer.pointers.get(valueString)
		if (pointerLocations) pointerLocations.add(currentIndex)
		else buffer.pointers.set(valueString, new Set([currentIndex])) //buffer.pointers maps values to the set of indices that need to point to the value
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
	RecursiveType,
	OptionalType,
	PointerType,
	REPEATED_TYPE,
	MILLIS_PER_DAY,
	MILLIS_PER_MINUTE
}